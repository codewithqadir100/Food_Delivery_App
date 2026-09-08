<?php declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\NewPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->session()->get('email', $request->input('email')),
            'token' => $request->route('token'),
        ]);
    }

    public function store(NewPasswordRequest $request): RedirectResponse
    {
        $email = $request->validated('email');
        $token = $request->validated('token');

        $resetToken = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('token', $token)
            ->first();

        if (!$resetToken) {
            return back()->withErrors(['email' => 'Invalid or expired reset link']);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'User not found']);
        }

        $user->update([
            'password' => $request->validated('password'),
            'remember_token' => Str::random(60),
        ]);

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        event(new PasswordReset($user));

        $loginRoute = match ($user->role) {
            User::ROLE_RESTAURANT_OWNER => 'restaurant.login',
            User::ROLE_ADMIN => 'admin.login',
            default => 'login',
        };

        return redirect()->route($loginRoute)->with('status', 'Password reset successfully');
    }
}