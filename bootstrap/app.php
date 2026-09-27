<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureApprovedAdmin;
use App\Http\Middleware\EnsureApprovedRestaurant;
use App\Http\Middleware\EnsureCustomer;
use App\Http\Middleware\EnsureRestaurantExists;
use App\Http\Middleware\EnsureRestaurantOwner;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'customer' => EnsureCustomer::class,
            'restaurant_owner' => EnsureRestaurantOwner::class,
            'approved_restaurant' => EnsureApprovedRestaurant::class,
            'restaurant_exists' => EnsureRestaurantExists::class,
            'admin' => EnsureAdmin::class,
            'approved_admin' => EnsureApprovedAdmin::class,
            'super_admin' => EnsureSuperAdmin::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('restaurant/*') || $request->is('verify-email') || $request->is('verify-email/*')) {
                return route('restaurant.login');
            }

            if ($request->is('admin/*') || $request->is('super-admin/*')) {
                return route('admin.login');
            }

            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
