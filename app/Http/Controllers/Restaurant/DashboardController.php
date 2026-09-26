<?php declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Services\RestaurantOrderStatsService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly RestaurantOrderStatsService $stats)
    {
    }

    public function index(): Response
    {
        $user = Auth::user();
        $restaurant = $user->restaurant;

        if ($user->isPending() || !$restaurant || $restaurant->isPending()) {
            return Inertia::render('Restaurant/Dashboard', [
                'restaurant' => $restaurant,
                'status' => $user->status,
            ]);
        }

        $recentOrders = $restaurant->orders()
            ->with('customer:id,name')
            ->withCount('items')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Restaurant/Dashboard', [
            'restaurant' => $restaurant,
            'stats' => $this->stats->buildStats($restaurant),
            'recentOrders' => $recentOrders,
        ]);
    }
}