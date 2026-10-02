<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RestaurantCompletionRequest;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\User;
use App\Services\BannedAccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    private const INTENT_CUSTOMER = 'customer';

    private const INTENT_RESTAURANT = 'restaurant';

    public function __construct(private readonly BannedAccountService $bannedAccounts) {}

    public function redirect(Request $request): RedirectResponse
    {
        $request->session()->put(
            'google_auth_intent',
            $request->query('intent') === self::INTENT_CUSTOMER
                ? self::INTENT_CUSTOMER
                : self::INTENT_RESTAURANT,
        );

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $intent = $request->session()->pull('google_auth_intent', self::INTENT_RESTAURANT);
        $intent = $intent === self::INTENT_CUSTOMER ? self::INTENT_CUSTOMER : self::INTENT_RESTAURANT;

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()->route($this->loginRoute($intent))->with('error', 'Google sign-in could not be completed.');
        }

        $email = $googleUser->getEmail();
        $googleId = (string) $googleUser->getId();

        if ($email === null || $email === '' || $googleId === '') {
            return redirect()->route($this->loginRoute($intent))->withErrors([
                'email' => 'Google did not return an email address for this account.',
            ]);
        }

        $user = User::query()->where('google_id', $googleId)->first()
            ?? User::query()->where('email', $email)->first();

        if ($intent === self::INTENT_CUSTOMER) {
            return $this->authenticateCustomer($request, $googleUser, $user, $email, $googleId);
        }

        return $this->authenticateRestaurantOwner($request, $googleUser, $user, $email, $googleId);
    }

    private function authenticateCustomer(
        Request $request,
        SocialiteUser $googleUser,
        ?User $user,
        string $email,
        string $googleId,
    ): RedirectResponse {
        if ($user && ! $user->isCustomer()) {
            return redirect()->route('login')->withErrors([
                'email' => 'This email is already registered with a different account type.',
            ]);
        }

        if ($user?->isBanned()) {
            return $this->bannedAccounts->refuseLogin($request);
        }

        $isNew = $user === null;

        if ($isNew) {
            $user = User::create([
                'name' => $googleUser->getName() ?: 'Customer',
                'email' => $email,
                'google_id' => $googleId,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(40)),
                'role' => User::ROLE_CUSTOMER,
                'status' => User::STATUS_APPROVED,
            ]);
        } else {
            $user->forceFill([
                'google_id' => $googleId,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ])->save();
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        if ($isNew) {
            return redirect()->route($user->afterEmailVerifiedRoute());
        }

        return redirect()->intended('/');
    }

    private function authenticateRestaurantOwner(
        Request $request,
        SocialiteUser $googleUser,
        ?User $user,
        string $email,
        string $googleId,
    ): RedirectResponse {
        if ($user && ! $user->isRestaurantOwner()) {
            return redirect()->route('restaurant.login')->withErrors([
                'email' => 'This email is already registered with a different account type.',
            ]);
        }

        if ($user?->isBanned()) {
            return $this->bannedAccounts->refuseLogin($request);
        }

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: 'Restaurant',
                'email' => $email,
                'google_id' => $googleId,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(40)),
                'role' => User::ROLE_RESTAURANT_OWNER,
                'status' => User::STATUS_PENDING,
            ]);
        } else {
            $user->forceFill([
                'google_id' => $googleId,
                'email_verified_at' => $user->email_verified_at ?? now(),
            ])->save();
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        if (! $user->restaurant) {
            return redirect()->route('restaurant.register.complete');
        }

        return redirect()->intended(route('restaurant.dashboard'));
    }

    private function loginRoute(string $intent): string
    {
        return $intent === self::INTENT_CUSTOMER ? 'login' : 'restaurant.login';
    }

    public function createComplete(): Response|RedirectResponse
    {
        $user = Auth::user();

        if ($user->restaurant) {
            return redirect()->route('restaurant.dashboard');
        }

        return Inertia::render('Auth/RestaurantComplete', [
            'categories' => RestaurantCategory::query()->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function storeComplete(RestaurantCompletionRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->restaurant) {
            return redirect()->route('restaurant.dashboard');
        }

        $validated = $request->validated();
        $isHomeChef = $request->boolean('is_home_chef');

        DB::transaction(function () use ($user, $validated, $isHomeChef) {
            $user->update([
                'name' => $validated['restaurant_name'],
            ]);

            Restaurant::create([
                'user_id' => $user->id,
                'name' => $validated['restaurant_name'],
                'restaurant_category_id' => $validated['restaurant_category_id'],
                'is_home_chef' => $isHomeChef,
                'phone' => $validated['phone'] ?? null,
                'description' => $validated['description'] ?? null,
                'status' => Restaurant::STATUS_PENDING,
            ]);
        });

        return redirect()->route('restaurant.dashboard');
    }
}
