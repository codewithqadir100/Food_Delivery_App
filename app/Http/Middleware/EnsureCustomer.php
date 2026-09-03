<?php declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->isCustomer()) {
            abort(403, 'Access denied. Customers only.');
        }

        return $next($request);
    }
}