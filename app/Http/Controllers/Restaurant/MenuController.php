<?php

namespace App\Http\Controllers\Restaurant;

use Illuminate\Routing\Controller;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $restaurant = auth()->user()->restaurant;
        
        return Inertia::render('Restaurant/Menu', [
            'restaurant' => $restaurant,
        ]);
    }
}