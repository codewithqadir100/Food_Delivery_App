<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $user = $request->user();

        if (! $user->isRestaurantOwner()) {
            abort(403);
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('restaurant.dashboard');
        }

        $sent = $user->sendEmailVerificationNotification();

        return Inertia::render('Auth/VerifyEmail', [
            'status' => session('status') ?: ($sent ? 'verification-link-sent' : null),
        ]);
    }
}
