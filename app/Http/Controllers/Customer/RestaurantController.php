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

        if (!$user) {
            $restaurants = Restaurant::where('status', Restaurant::STATUS_APPROVED)
                ->with('restaurantCategory')
                ->get()
                ->map(function($restaurant) {
                    return [
                        'restaurant' => $restaurant,
                        'distance_km' => null,           
                        'delivery_charge' => null,
                    ];
                });
            
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

        
        if (!$user || !$user->latitude || !$user->longitude) {
            return response()->json([
                'message' => 'Customer location not set',
                'data' => []
            ], 400);
        }

        $restaurants = Restaurant::where('status', Restaurant::STATUS_APPROVED)
            ->with('restaurantCategory')
            ->get()
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
            ->map(function($restaurant) use ($user) {
                $distance = $this->deliveryService->calculateDistance(
                    $restaurant->latitude,
                    $restaurant->longitude,
                    $user->latitude,
                    $user->longitude
                );
                
                $deliveryCharge = $this->deliveryService->calculateDeliveryCharge(
                    $distance,
                    self::BASE_DELIVERY_FEE,
                    self::PER_KM_FEE
                );

                return [
                    'restaurant' => $restaurant,
                    'distance_km' => round($distance, 2),
                    'delivery_charge' => $deliveryCharge,
                ];
            });

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

        if (!$user || !$user->latitude || !$user->longitude) {
            return response()->json([
                'message' => 'Customer location not set',
            ], 400);
        }

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

        $deliveryCharge = $this->deliveryService->calculateDeliveryCharge(
            $distance,
            self::BASE_DELIVERY_FEE,
            self::PER_KM_FEE
        );

        return response()->json([
            'data' => RestaurantResource::make($restaurant)
                ->additional([
                    'distance_km' => round($distance, 2),
                    'delivery_charge' => $deliveryCharge,
                ])
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $user = auth()->user();

        if (!$user || !$user->latitude || !$user->longitude) {
            return response()->json([
                'message' => 'Customer location not set',
                'data' => []
            ], 400);
        }

        $restaurants = Restaurant::where('status', Restaurant::STATUS_APPROVED)
            ->where('name', 'LIKE', "%{$query}%")
            ->orWhereHas('restaurantCategory', function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%");
            })
            ->with('restaurantCategory')
            ->get()
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
            ->map(function($restaurant) use ($user) {
                $distance = $this->deliveryService->calculateDistance(
                    $restaurant->latitude,
                    $restaurant->longitude,
                    $user->latitude,
                    $user->longitude
                );
                
                $deliveryCharge = $this->deliveryService->calculateDeliveryCharge(
                    $distance,
                    self::BASE_DELIVERY_FEE,
                    self::PER_KM_FEE
                );

                return [
                    'restaurant' => $restaurant,
                    'distance_km' => round($distance, 2),
                    'delivery_charge' => $deliveryCharge,
                ];
            });

        return response()->json([
            'data' => RestaurantResource::collection($restaurants->take(12))
        ]);
    }
}