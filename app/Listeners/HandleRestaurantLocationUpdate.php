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

        $distanceMoved = $this->deliveryService->calculateDistance(
            $oldLat,
            $oldLon,
            $newLat,
            $newLon
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