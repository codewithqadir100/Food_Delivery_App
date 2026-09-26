<?php

namespace App\Http\Controllers\Customer;

use App\Models\Restaurant;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class CustomerRestaurantMenuController extends Controller
{
    public function show(Restaurant $restaurant)
    {
        if ($restaurant->status !== 'approved' && !$restaurant->is_open) {
            abort(404);
        }

        return Inertia::render('Customer/RestaurantMenu', [
            'restaurant' => $restaurant,
            'address' => auth()->user()?->primaryAddress ?? null,
        ]);
    }
}