<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Services\DeliveryCalculationService;
use App\Services\RestaurantListingService;
use App\Services\WishlistService;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function __construct(
        private DeliveryCalculationService $deliveryService,
        private RestaurantListingService $listing,
        private WishlistService $wishlists,
    ) {}

    public function index(Request $request)
    {
        $user = auth()->user();
        $categoryId = $request->get('category_id');

        $query = Restaurant::query()
            ->visibleToCustomers()
            ->with(['restaurantCategory', 'subscription.plan']);

        if ($categoryId) {
            $query->where('restaurant_category_id', $categoryId);
        }

        $customerAddress = $user?->isCustomer() ? $user->primaryAddress : null;
        $page = max(1, (int) $request->get('page', 1));
        $perPage = 12;
        $paginator = $this->listing->paginate($query, $customerAddress, $perPage, $page);
        $this->wishlists->mark($paginator->getCollection(), $user);
        $total = $paginator->total();

        return response()->json([
            'data' => RestaurantResource::collection($paginator->getCollection()),
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    public function show($id)
    {
        $user = auth()->user();

        $restaurant = Restaurant::query()
            ->with(['restaurantCategory', 'subscription.plan'])
            ->findOrFail($id);

        if ($restaurant->listingAvailability() === Restaurant::LISTING_HIDDEN) {
            abort(404);
        }

        $restaurant->listing_availability = $restaurant->listingAvailability();
        $restaurant->is_featured = (bool) $restaurant->subscription?->plan?->isFeatured();

        $customerAddress = $user?->isCustomer() ? $user->primaryAddress : null;

        $distance_km = null;
        $delivery_charge = null;

        if (
            $customerAddress
            && $customerAddress->latitude !== null
            && $customerAddress->longitude !== null
            && $restaurant->latitude !== null
            && $restaurant->longitude !== null
        ) {
            $distance = $this->deliveryService->calculateDistance(
                (float) $restaurant->latitude,
                (float) $restaurant->longitude,
                (float) $customerAddress->latitude,
                (float) $customerAddress->longitude,
            );

            if ($restaurant->isOrderable()) {
                $validation = $this->deliveryService->validateDeliveryLocation(
                    (float) $restaurant->latitude,
                    (float) $restaurant->longitude,
                    (int) $restaurant->service_radius_km,
                    (float) $customerAddress->latitude,
                    (float) $customerAddress->longitude,
                );

                if (! $validation['valid']) {
                    return response()->json([
                        'message' => $validation['error'],
                        'restaurant' => null,
                    ], 400);
                }
            }

            $distance_km = round($distance, 2);
            $delivery_charge = $this->deliveryService->calculateDeliveryCharge($distance);
        }

        $restaurant->distance_km = $distance_km;
        $restaurant->delivery_charge = $delivery_charge;
        $this->wishlists->mark(collect([$restaurant]), $user);

        return response()->json([
            'data' => RestaurantResource::make($restaurant),
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $categoryId = $request->get('category_id');
        $user = auth()->user();

        $restaurants = Restaurant::query()
            ->visibleToCustomers()
            ->where(function ($builder) use ($query) {
                $builder->where('restaurants.name', 'LIKE', "%{$query}%")
                    ->orWhereHas('restaurantCategory', function ($subQuery) use ($query) {
                        $subQuery->where('name', 'LIKE', "%{$query}%");
                    });
            })
            ->with(['restaurantCategory', 'subscription.plan']);

        if ($categoryId) {
            $restaurants->where('restaurant_category_id', $categoryId);
        }

        $customerAddress = $user?->isCustomer() ? $user->primaryAddress : null;

        $results = $this->listing->take($restaurants, $customerAddress, 12);
        $this->wishlists->mark($results, $user);

        return response()->json([
            'data' => RestaurantResource::collection($results),
        ]);
    }
}
