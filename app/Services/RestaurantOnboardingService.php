<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Restaurant;

class RestaurantOnboardingService
{
    public function status(?Restaurant $restaurant): array
    {
        if (! $restaurant) {
            return [
                'profile' => false,
                'location' => false,
                'menu_category' => false,
                'menu_item' => false,
                'complete' => false,
            ];
        }

        $profile = filled($restaurant->phone);
        $location = $restaurant->latitude !== null
            && $restaurant->longitude !== null
            && filled($restaurant->city_name)
            && $restaurant->service_radius_km !== null;
        $categoryCount = $restaurant->menu_categories_count
            ?? $restaurant->menuCategories()->count();
        $itemCount = $restaurant->menu_items_count
            ?? $restaurant->menuItems()->count();

        $category = $categoryCount > 0;
        $item = $itemCount > 0;

        return [
            'profile' => $profile,
            'location' => $location,
            'menu_category' => $category,
            'menu_item' => $item,
            'complete' => $profile && $location && $category && $item,
        ];
    }
}
