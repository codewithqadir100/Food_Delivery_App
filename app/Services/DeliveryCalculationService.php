<?php

namespace App\Services;

class DeliveryCalculationService
{
    private const EARTH_RADIUS_KM = 6371;

    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return self::EARTH_RADIUS_KM * $c;
    }

    public function isWithinDeliveryZone(
        float $restaurantLat,
        float $restaurantLon,
        int $serviceRadiusKm,
        float $customerLat,
        float $customerLon
    ): bool {
        $distance = $this->calculateDistance($restaurantLat, $restaurantLon, $customerLat, $customerLon);
        return $distance <= $serviceRadiusKm;
    }

    public function calculateDeliveryCharge(
        float $distance,
        int $baseFee,
        int $perKmFee
    ): int {
        return $baseFee + (int)ceil($distance * $perKmFee);
    }

    public function validateDeliveryLocation(
        float $restaurantLat,
        float $restaurantLon,
        int $serviceRadiusKm,
        float $customerLat,
        float $customerLon
    ): array {
        if (!$this->isValidCoordinates($restaurantLat, $restaurantLon)) {
            return ['valid' => false, 'error' => 'Invalid restaurant coordinates'];
        }

        if (!$this->isValidCoordinates($customerLat, $customerLon)) {
            return ['valid' => false, 'error' => 'Invalid customer coordinates'];
        }

        if ($serviceRadiusKm < 1 || $serviceRadiusKm > 100) {
            return ['valid' => false, 'error' => 'Invalid service radius'];
        }

        $isWithinZone = $this->isWithinDeliveryZone(
            $restaurantLat,
            $restaurantLon,
            $serviceRadiusKm,
            $customerLat,
            $customerLon
        );

        if (!$isWithinZone) {
            $distance = $this->calculateDistance($restaurantLat, $restaurantLon, $customerLat, $customerLon);
            return [
                'valid' => false,
                'error' => 'Delivery location is outside service zone',
                'distance' => round($distance, 2),
                'serviceRadius' => $serviceRadiusKm
            ];
        }

        return ['valid' => true];
    }

    private function isValidCoordinates(float $lat, float $lon): bool
    {
        return $lat >= -90 && $lat <= 90 && $lon >= -180 && $lon <= 180;
    }
}