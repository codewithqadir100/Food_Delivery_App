<?php declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApprovedRestaurant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isRestaurantOwner()) {
            abort(403, 'Access denied.');
        }

        if ($user->isRejected()) {
            abort(403, 'Your account has been rejected.');
        }

        if ($user->isPending()) {
            return redirect()->route('restaurant.dashboard');
        }

        $restaurant = $user->restaurant;

        if (!$restaurant || $restaurant->isPending()) {
            return redirect()->route('restaurant.dashboard');
        }

        if ($restaurant->isRejected()) {
            abort(403, 'Your restaurant has been rejected.');
        }

        return $next($request);
    }
}