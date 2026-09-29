<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CustomerAddress;
use App\Models\Restaurant;
use Illuminate\Support\Collection;

class RestaurantListingService
{
    public function __construct(private readonly DeliveryCalculationService $delivery) {}

    public function present(Collection $restaurants, ?CustomerAddress $address): Collection
    {
        $hasAddress = $address
            && $address->latitude !== null
            && $address->longitude !== null;

        return $restaurants
            ->map(function (Restaurant $restaurant) use ($address, $hasAddress) {
                $restaurant->listing_availability = $restaurant->listingAvailability();
                $restaurant->is_featured = (bool) $restaurant->subscription?->plan?->isFeatured();

                if ($restaurant->listing_availability === Restaurant::LISTING_HIDDEN) {
                    return null;
                }

                if (! $hasAddress) {
                    $restaurant->distance_km = null;
                    $restaurant->delivery_charge = null;

                    return $restaurant;
                }

                if ($restaurant->latitude === null || $restaurant->longitude === null || $restaurant->service_radius_km === null) {
                    return null;
                }

                $distance = $this->delivery->calculateDistance(
                    (float) $restaurant->latitude,
                    (float) $restaurant->longitude,
                    (float) $address->latitude,
                    (float) $address->longitude,
                );

                if ($distance > (float) $restaurant->service_radius_km) {
                    return null;
                }

                $restaurant->distance_km = round($distance, 2);
                $restaurant->delivery_charge = $this->delivery->calculateDeliveryCharge($distance);

                return $restaurant;
            })
            ->filter()
            ->sort(function (Restaurant $left, Restaurant $right) {
                $rank = function (Restaurant $restaurant) {
                    return [
                        $restaurant->listing_availability === Restaurant::LISTING_AVAILABLE ? 0 : 1,
                        $restaurant->is_featured ? 0 : 1,
                        $restaurant->distance_km ?? PHP_FLOAT_MAX,
                    ];
                };

                return $rank($left) <=> $rank($right);
            })
            ->values();
    }
}
