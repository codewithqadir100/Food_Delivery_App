<?php

declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Services\RestaurantOnboardingService;
use App\Services\RestaurantOrderStatsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly RestaurantOrderStatsService $stats,
        private readonly RestaurantOnboardingService $onboarding,
    ) {}

    public function index(): Response|RedirectResponse
    {
        $user = Auth::user();
        $restaurant = $user->restaurant()->withCount(['menuCategories', 'menuItems'])->with('subscription.plan')->first();

        if (! $restaurant) {
            return redirect()->route('restaurant.register.complete');
        }

        $props = [
            'restaurant' => $restaurant,
            'status' => $restaurant->status,
            'onboarding' => $this->onboarding->status($restaurant),
            'subscription' => $restaurant->subscription,
        ];

        if ($user->isApproved() && $restaurant->isApproved()) {
            $props['stats'] = $this->stats->buildStats($restaurant);
            $props['recentOrders'] = $restaurant->orders()
                ->with('customer:id,name')
                ->withCount('items')
                ->latest()
                ->limit(5)
                ->get();
        }

        return Inertia::render('Restaurant/Dashboard', $props);
    }
}
