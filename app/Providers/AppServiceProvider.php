<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Policies\MenuCategoryPolicy;
use App\Policies\MenuItemPolicy;
use App\Policies\OrderPolicy;
use App\Policies\RestaurantPolicy;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        VerifyEmail::createUrlUsing(function (object $notifiable): string {
            $relativeUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes((int) config('auth.verification.expire', 60)),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ],
                false,
            );

            return URL::to($relativeUrl);
        });

        Gate::policy(Restaurant::class, RestaurantPolicy::class);
        Gate::policy(MenuItem::class, MenuItemPolicy::class);
        Gate::policy(MenuCategory::class, MenuCategoryPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
    }
}
