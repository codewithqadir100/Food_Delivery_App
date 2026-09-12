<?php declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RestaurantLoginRequest;
use App\Http\Requests\Auth\RestaurantRegisterRequest;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantAuthController extends Controller
{
    public function createRegister(): Response
    {
        return Inertia::render('Auth/RestaurantRegister', [
            'categories' => RestaurantCategory::select('id', 'name')->get(),
        ]);
    }

    public function storeRegister(RestaurantRegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['restaurant_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => User::ROLE_RESTAURANT_OWNER,
                'status' => User::STATUS_PENDING,
            ]);

            Restaurant::create([
                'user_id' => $user->id,
                'name' => $validated['restaurant_name'],
                'restaurant_category_id' => $validated['restaurant_category_id'],
                'city' => $validated['city'],
                'address' => $validated['address'],
                'phone' => $validated['phone'] ?? null,
                'description' => $validated['description'] ?? null,
                'status' => Restaurant::STATUS_PENDING,
            ]);
        });

        $user = User::where('email', $validated['email'])->first();

        Auth::login($user);

        return redirect()->route('restaurant.dashboard');
    }

    public function createLogin(): Response
    {
        return Inertia::render('Auth/RestaurantLogin', [
            'status' => session('status'),
        ]);
    }

    public function storeLogin(RestaurantLoginRequest $request): RedirectResponse
    {
        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $user = Auth::user();

        if (!$user->isRestaurantOwner()) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('restaurant.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}