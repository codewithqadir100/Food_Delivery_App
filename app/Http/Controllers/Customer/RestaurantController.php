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
        $customerAddress = $user?->isCustomer() ? $user->primaryAddress : null;
        $page = max(1, (int) $request->get('page', 1));
        $perPage = 12;
        $paginator = $this->listing->paginate(
            $this->listingQuery($request),
            $customerAddress,
            $perPage,
            $page,
            $this->filters($request),
        );
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
        $user = auth()->user();
        $customerAddress = $user?->isCustomer() ? $user->primaryAddress : null;
        $results = $this->listing->take(
            $this->listingQuery($request),
            $customerAddress,
            12,
            $this->filters($request),
        );
        $this->wishlists->mark($results, $user);

        return response()->json([
            'data' => RestaurantResource::collection($results),
        ]);
    }

    private function listingQuery(Request $request)
    {
        $query = Restaurant::query()
            ->visibleToCustomers()
            ->with(['restaurantCategory', 'subscription.plan']);

        $term = trim((string) $request->get('q', ''));

        if ($term !== '') {
            $query->where(function ($builder) use ($term) {
                $builder->where('restaurants.name', 'LIKE', "%{$term}%")
                    ->orWhereHas('restaurantCategory', function ($subQuery) use ($term) {
                        $subQuery->where('name', 'LIKE', "%{$term}%");
                    });
            });
        }

        if ($request->filled('category_id')) {
            $query->where('restaurant_category_id', $request->integer('category_id'));
        }

        return $query;
    }

    /**
     * @return array{featured: bool, home_chef: bool, min_rating: float|null, sort: string|null}
     */
    private function filters(Request $request): array
    {
        $sort = (string) $request->get('sort', '');

        return [
            'featured' => $request->boolean('featured'),
            'home_chef' => $request->boolean('home_chef'),
            'min_rating' => $request->filled('min_rating') ? (float) $request->get('min_rating') : null,
            'sort' => in_array($sort, [RestaurantListingService::SORT_NEAREST, RestaurantListingService::SORT_TOP_RATED], true)
                ? $sort
                : null,
        ];
    }
}
