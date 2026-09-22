<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Services\DeliveryCalculationService;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    private const PER_PAGE = 12;
    private const BASE_DELIVERY_FEE = 100;
    private const PER_KM_FEE = 50;

    public function __construct(
        private DeliveryCalculationService $deliveryService
    ) {}

    public function index(Request $request)
    {
        $user = auth()->user();
        $categoryId = $request->get('category_id');
        
        $query = Restaurant::where('status', Restaurant::STATUS_APPROVED)->where('is_open', true)
            ->with('restaurantCategory');
        
        if ($categoryId) {
            $query->where('restaurant_category_id', $categoryId);
        }
        
        $restaurants = $query->get();

        if ($user && $user->latitude && $user->longitude) {
            $restaurants = $restaurants
                ->filter(function($restaurant) use ($user) {
                    $distance = $this->deliveryService->calculateDistance(
                        $restaurant->latitude,
                        $restaurant->longitude,
                        $user->latitude,
                        $user->longitude
                    );
                    
                    return $distance <= $restaurant->service_radius_km;
                })
                ->values()
                ->each(function($restaurant) use ($user) {
                    $distance = $this->deliveryService->calculateDistance(
                        $restaurant->latitude,
                        $restaurant->longitude,
                        $user->latitude,
                        $user->longitude
                    );
                    
                    $restaurant->distance_km = round($distance, 2);
                    $restaurant->delivery_charge = $this->deliveryService->calculateDeliveryCharge(
                        $distance,
                        self::BASE_DELIVERY_FEE,
                        self::PER_KM_FEE
                    );
                });
        } else {
            $restaurants = $restaurants->each(function($restaurant) {
                $restaurant->distance_km = null;
                $restaurant->delivery_charge = null;
            });
        }

        $page = $request->get('page', 1);
        $paginated = $restaurants->forPage($page, self::PER_PAGE);
        $total = $restaurants->count();

        return response()->json([
            'data' => RestaurantResource::collection($paginated),
            'meta' => [
                'current_page' => $page,
                'per_page' => self::PER_PAGE,
                'total' => $total,
                'last_page' => ceil($total / self::PER_PAGE),
            ]
        ]);
    }

    public function show($id)
    {
        $user = auth()->user();
        
        $restaurant = Restaurant::where('status', Restaurant::STATUS_APPROVED)
            ->with('restaurantCategory')
            ->findOrFail($id);

        $distance_km = null;
        $delivery_charge = null;

        if ($user && $user->latitude && $user->longitude) {
            $distance = $this->deliveryService->calculateDistance(
                $restaurant->latitude,
                $restaurant->longitude,
                $user->latitude,
                $user->longitude
            );

            $validation = $this->deliveryService->validateDeliveryLocation(
                $restaurant->latitude,
                $restaurant->longitude,
                $restaurant->service_radius_km,
                $user->latitude,
                $user->longitude
            );

            if (!$validation['valid']) {
                return response()->json([
                    'message' => $validation['error'],
                    'restaurant' => null
                ], 400);
            }

            $distance_km = round($distance, 2);
            $delivery_charge = $this->deliveryService->calculateDeliveryCharge(
                $distance,
                self::BASE_DELIVERY_FEE,
                self::PER_KM_FEE
            );
        }

        $restaurant->distance_km = $distance_km;
        $restaurant->delivery_charge = $delivery_charge;

        return response()->json([
            'data' => RestaurantResource::make($restaurant)
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $categoryId = $request->get('category_id');
        $user = auth()->user();

        $restaurants = Restaurant::where('status', Restaurant::STATUS_APPROVED)
            ->where('name', 'LIKE', "%{$query}%")
            ->orWhereHas('restaurantCategory', function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%");
            })
            ->with('restaurantCategory');
        
        if ($categoryId) {
            $restaurants = $restaurants->where('restaurant_category_id', $categoryId);
        }
        
        $restaurants = $restaurants->get();

        if ($user && $user->latitude && $user->longitude) {
            $restaurants = $restaurants
                ->filter(function($restaurant) use ($user) {
                    $distance = $this->deliveryService->calculateDistance(
                        $restaurant->latitude,
                        $restaurant->longitude,
                        $user->latitude,
                        $user->longitude
                    );
                    
                    return $distance <= $restaurant->service_radius_km;
                })
                ->values()
                ->each(function($restaurant) use ($user) {
                    $distance = $this->deliveryService->calculateDistance(
                        $restaurant->latitude,
                        $restaurant->longitude,
                        $user->latitude,
                        $user->longitude
                    );
                    
                    $restaurant->distance_km = round($distance, 2);
                    $restaurant->delivery_charge = $this->deliveryService->calculateDeliveryCharge(
                        $distance,
                        self::BASE_DELIVERY_FEE,
                        self::PER_KM_FEE
                    );
                });
        } else {
            $restaurants = $restaurants->each(function($restaurant) {
                $restaurant->distance_km = null;
                $restaurant->delivery_charge = null;
            });
        }

        return response()->json([
            'data' => RestaurantResource::collection($restaurants->take(12))
        ]);
    }
}