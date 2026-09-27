<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRestaurantExists
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->restaurant) {
            return redirect()->route('restaurant.register.complete');
        }

        return $next($request);
    }
}
