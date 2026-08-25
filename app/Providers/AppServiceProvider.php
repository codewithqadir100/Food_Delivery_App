<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Policies\MenuCategoryPolicy;
use App\Policies\MenuItemPolicy;
use App\Policies\RestaurantPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Restaurant::class, RestaurantPolicy::class);
        Gate::policy(MenuItem::class, MenuItemPolicy::class);
        Gate::policy(MenuCategory::class, MenuCategoryPolicy::class);
    }
}