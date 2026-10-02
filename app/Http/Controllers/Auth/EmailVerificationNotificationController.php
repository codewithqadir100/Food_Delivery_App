<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user instanceof User || ! $user->canVerifyEmail()) {
            abort(403);
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->route($user->whenAlreadyVerifiedRoute());
        }

        if (! $user->sendEmailVerificationNotification()) {
            return back()->with('status', 'verification-link-throttled');
        }

        return back()->with('status', 'verification-link-sent');
    }
}
