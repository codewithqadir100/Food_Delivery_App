<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events\OrderPlaced;
use App\Events\RestaurantLocationUpdated;
use App\Listeners\HandleRestaurantLocationUpdate;
use App\Listeners\NotifyRestaurantOfNewOrder;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderPlaced::class => [
            NotifyRestaurantOfNewOrder::class,
        ],
        RestaurantLocationUpdated::class => [
            HandleRestaurantLocationUpdate::class,
        ],
    ];
}
