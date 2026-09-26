<?php

namespace App\Http\Controllers\Restaurant;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class MenuItemFormPageController extends Controller
{
    public function create(request $request)
    {

        $restaurant = auth()->user()->restaurant;
        $categoryId = $request->query('category_id');
        $categories = $restaurant->menuCategories()->get();
        
        return Inertia::render('Restaurant/MenuItemFormPage', [
            'restaurant' => $restaurant,
            'categories' => $categories,
            'item' => null,
            'restaurantId' => $restaurant->id,
            'selectedCategoryId' => $categoryId,
        ]);
    }

    public function edit(MenuItem $item)
    {
        $this->authorize('update', $item);
        
        $restaurant = auth()->user()->restaurant;
        
        return Inertia::render('Restaurant/MenuItemFormPage', [
            'restaurant' => $restaurant,
            'categories' => $restaurant->$categories,
            'item' => $item,
            'restaurantId' => $restaurant->id,
            'selectedCategoryId' => $categoryId,
        ]);
    }
}