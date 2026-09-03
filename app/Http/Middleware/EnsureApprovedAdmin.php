<?php declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApprovedAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isAdmin()) {
            abort(403, 'Access denied.');
        }

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if ($user->isRejected()) {
            abort(403, 'Your account has been rejected.');
        }

        if ($user->isPending()) {
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}