<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;

class BannedAccountService
{
    public const NOTICE_SHOWN = 'account_ban_notice_shown';

    public function intercept(Request $request): Response
    {
        if ($request->session()->get(self::NOTICE_SHOWN) === true) {
            $this->endSession($request);

            return redirect()->route('restaurant.login');
        }

        $request->session()->put(self::NOTICE_SHOWN, true);

        return $this->page(signedIn: true)->toResponse($request);
    }

    public function refuseLogin(Request $request): RedirectResponse
    {
        $this->endSession($request);

        return redirect()->route('account.banned');
    }

    public function page(bool $signedIn): InertiaResponse
    {
        return Inertia::render('Auth/AccountBanned', [
            'signedIn' => $signedIn,
        ]);
    }

    public function endSession(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
