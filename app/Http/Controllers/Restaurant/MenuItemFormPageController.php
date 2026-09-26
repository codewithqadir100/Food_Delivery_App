<?php

namespace App\Http\Controllers\Restaurant;

use App\Models\MenuItem;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class MenuItemFormPageController extends Controller
{
    public function create()
    {
        $restaurant = auth()->user()->restaurant;
        
        return Inertia::render('Restaurant/MenuItemFormPage', [
            'categories' => $restaurant->menuCategories,
            'item' => null,
            'restaurantId' => $restaurant->id,
        ]);
    }

    public function edit(MenuItem $item)
    {
        $this->authorize('update', $item);
        
        $restaurant = auth()->user()->restaurant;
        
        return Inertia::render('Restaurant/MenuItemFormPage', [
            'categories' => $restaurant->menuCategories,
            'item' => $item,
            'restaurantId' => $restaurant->id,
        ]);
    }
}