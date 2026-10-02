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
        $user = $request->user();

        if (! $user || ! $user->isRestaurantOwner()) {
            abort(403, 'Access denied. Restaurant owners only.');
        }

        if ($user->isBanned()) {
            abort(403, 'Your account has been banned.');
        }

        if ($user->isRejected()) {
            abort(403, 'Your account has been rejected.');
        }

        return $next($request);
    }
}
