<?php declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $restaurant = $user->restaurant;

        if ($user->isPending() || !$restaurant || $restaurant->isPending()) {
            return Inertia::render('Restaurant/Dashboard', [
                'restaurant' => $restaurant,
                'status' => $user->status,
            ]);
        }

        return Inertia::render('Restaurant/Dashboard', [
            'restaurant' => $restaurant,
        ]);
    }
}