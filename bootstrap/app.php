<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'customer' => \App\Http\Middleware\EnsureCustomer::class,
            'restaurant_owner' => \App\Http\Middleware\EnsureRestaurantOwner::class,
            'approved_restaurant' => \App\Http\Middleware\EnsureApprovedRestaurant::class,
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'approved_admin' => \App\Http\Middleware\EnsureApprovedAdmin::class,
            'super_admin' => \App\Http\Middleware\EnsureSuperAdmin::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('restaurant/*')) {
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