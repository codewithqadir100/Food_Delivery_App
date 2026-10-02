<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'loginRoute' => User::loginRouteForAccount($request->query('account')),
        ]);
    }

    public function store(PasswordResetRequest $request): RedirectResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        $redirect = redirect()->route('password.request', array_filter([
            'account' => $request->validated('account'),
        ]));

        if ($status !== Password::RESET_LINK_SENT) {
            return $redirect->withErrors(['email' => __($status)]);
        }

        return $redirect->with('status', __($status));
    }
}
