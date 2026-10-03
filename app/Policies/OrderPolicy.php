<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Services\ReviewService;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        if ($user->isCustomer()) {
            return $user->id === $order->customer_id;
        }

        if ($user->isRestaurantOwner()) {
            return $user->id === $order->restaurant->user_id;
        }

        return false;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->isRestaurantOwner()
            && $user->isApproved()
            && $user->id === $order->restaurant->user_id;
    }

    public function cancel(User $user, Order $order): bool
    {
        return $user->isCustomer()
            && $user->id === $order->customer_id
            && $order->canBeCancelledByCustomer();
    }

    public function review(User $user, Order $order): bool
    {
        return app(ReviewService::class)->canWrite($order, $user);
    }
}
