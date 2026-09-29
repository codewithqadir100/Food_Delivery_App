<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\BannedAccountService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountNotBanned
{
    public function __construct(private readonly BannedAccountService $bannedAccounts) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isBanned()) {
            return $next($request);
        }

        return $this->bannedAccounts->intercept($request);
    }
}
