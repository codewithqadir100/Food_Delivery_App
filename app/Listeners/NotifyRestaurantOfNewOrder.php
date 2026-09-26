<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Notifications\NewOrderReceived;

class NotifyRestaurantOfNewOrder
{
    public function handle(OrderPlaced $event): void
    {
        $owner = $event->order->restaurant->user;

        $owner?->notify(new NewOrderReceived($event->order));
    }
}
