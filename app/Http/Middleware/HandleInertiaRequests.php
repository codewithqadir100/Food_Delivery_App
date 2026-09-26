<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'is_customer' => $user->isCustomer(),
                    'is_restaurant_owner' => $user->isRestaurantOwner(),
                    'is_admin' => $user->isAdmin(),
                    'is_super_admin' => $user->isSuperAdmin(),
                    'is_pending' => $user->isPending(),
                ] : null,

                'restaurant' => fn() => $user?->restaurant,

                'customer' => fn() => $user?->isCustomer()
                    ? $user->primaryAddress
                    : null,

                'cart' => fn() => $user?->isCustomer()
                    ? ['count' => app(CartService::class)->count()]
                    : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
