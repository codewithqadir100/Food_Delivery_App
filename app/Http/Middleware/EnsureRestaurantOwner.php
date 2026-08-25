<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRestaurantOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isRestaurantOwner()) {
            abort(403, 'Access denied. Restaurant owners only.');
        }

        return $next($request);
    }
}