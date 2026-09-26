<?php declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Order;
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

        $recentOrders = $restaurant->orders()
            ->with('customer:id,name')
            ->withCount('items')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Restaurant/Dashboard', [
            'restaurant' => $restaurant,
            'stats' => [
                'pending' => $restaurant->orders()->where('status', Order::STATUS_PENDING)->count(),
                'active' => $restaurant->orders()->whereIn('status', Order::ACTIVE_STATUSES)->count(),
                'delivered_today' => $restaurant->orders()
                    ->where('status', Order::STATUS_DELIVERED)
                    ->whereDate('delivered_at', today())
                    ->count(),
                'revenue_today' => (float) $restaurant->orders()
                    ->where('status', Order::STATUS_DELIVERED)
                    ->whereDate('delivered_at', today())
                    ->sum('total'),
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}