<?php declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\Restaurant;

class RestaurantOrderStatsService
{
    public function buildStats(Restaurant $restaurant): array
    {
        return [
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
        ];
    }
}
