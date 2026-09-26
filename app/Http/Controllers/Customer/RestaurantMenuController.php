<?php

namespace App\Http\Controllers\Customer;

use App\Models\Restaurant;
use Illuminate\Routing\Controller;

class RestaurantMenuController extends Controller
{
    public function show(Restaurant $restaurant)
    {
        if ($restaurant->status !== 'approved' && !$restaurant->is_open) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not available'
            ], 404);
        }

        $categories = $restaurant->menuCategories()
            ->with([
                'menuItems' => function ($query) {
                    $query->where('is_available', true)
                        ->orderBy('created_at', 'asc');
                }
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        $allItems = $restaurant->menuItems()
            ->where('is_available', true)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'restaurant' => [
                    'id' => $restaurant->id,
                    'name' => $restaurant->name,
                    'logo' => $restaurant->logo,
                    'rating' => $restaurant->rating,
                    'review_count' => $restaurant->review_count ?? 0,
                    'category' => $restaurant->restaurantCategory?->name,
                    'description' => $restaurant->description,
                    'latitude' => $restaurant->latitude,
                    'longitude' => $restaurant->longitude,
                    'city_name' => $restaurant->city_name,
                    'area_name' => $restaurant->area_name,
                    'street_address' => $restaurant->street_address,
                ],
                'categories' => $categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'item_count' => $category->menuItems->count(),
                    ];
                })->values(),
                'items' => $allItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'category_id' => $item->menu_category_id,
                        'name' => $item->name,
                        'description' => $item->description,
                        'price' => $item->price,
                        'image' => asset('storage/' . $item->image),
                        'is_available' => $item->is_available,
                    ];
                })->values(),
            ]
        ]);
    }
}