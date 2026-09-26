<?php

namespace App\Http\Controllers\Customer;

use App\Models\Restaurant;
use App\Services\DeliveryCalculationService;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class CustomerRestaurantMenuController extends Controller
{
    private const BASE_DELIVERY_FEE = 100;
    private const PER_KM_FEE = 50;

    public function __construct(
        private DeliveryCalculationService $deliveryService
    ) {}

    public function show(Restaurant $restaurant)
    {
        if ($restaurant->status !== 'approved' || !$restaurant->is_open) {
            abort(404);
        }

        $user = auth()->user();
        $address = $user?->isCustomer() ? $user->primaryAddress : null;

        $distance = null;
        $deliveryCharge = null;

        if (
            $address &&
            $address->latitude !== null &&
            $address->longitude !== null &&
            $restaurant->latitude !== null &&
            $restaurant->longitude !== null
        ) {
            $distance = $this->deliveryService->calculateDistance(
                $restaurant->latitude,
                $restaurant->longitude,
                $address->latitude,
                $address->longitude
            );

            $deliveryCharge = $this->deliveryService->calculateDeliveryCharge(
                $distance,
                self::BASE_DELIVERY_FEE,
                self::PER_KM_FEE
            );
        }

        return Inertia::render('Customer/RestaurantMenu', [
            'restaurant' => $restaurant,
            'address' => $address,
            'distance_km' => $distance !== null ? round($distance, 2) : null,
            'delivery_charge' => $deliveryCharge,
            'can_order' => $address !== null &&
                $address->latitude !== null &&
                $address->longitude !== null,
        ]);
    }
}
