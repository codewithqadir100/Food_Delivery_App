<?php

namespace App\Listeners;

use App\Events\RestaurantLocationUpdated;
use App\Services\DeliveryCalculationService;
use Illuminate\Support\Facades\Log;

class HandleRestaurantLocationUpdate
{
    public function __construct(
        private DeliveryCalculationService $deliveryService
    ) {}

    public function handle(RestaurantLocationUpdated $event): void
    {
        $oldLat = $event->oldLocation['latitude'];
        $oldLon = $event->oldLocation['longitude'];
        $newLat = $event->newLocation['latitude'];
        $newLon = $event->newLocation['longitude'];

        if ($oldLat === null || $oldLon === null || $newLat === null || $newLon === null) {
            Log::channel('delivery')->info('Restaurant location set', [
                'restaurant_id' => $event->restaurant->id,
                'restaurant_name' => $event->restaurant->name,
                'new_city' => $event->newLocation['city_name'],
                'timestamp' => now(),
            ]);

            return;
        }

        $distanceMoved = $this->deliveryService->calculateDistance(
            (float) $oldLat,
            (float) $oldLon,
            (float) $newLat,
            (float) $newLon
        );

        Log::channel('delivery')->info('Restaurant location updated', [
            'restaurant_id' => $event->restaurant->id,
            'restaurant_name' => $event->restaurant->name,
            'distance_moved_km' => round($distanceMoved, 2),
            'new_city' => $event->newLocation['city_name'],
            'timestamp' => now(),
        ]);
    }
}