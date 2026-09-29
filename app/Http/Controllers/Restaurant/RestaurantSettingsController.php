<?php

declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\UpdateRestaurantHomeChefRequest;
use App\Http\Requests\Restaurant\UpdateRestaurantPasswordRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantSettingsController extends Controller
{
    public function edit(): Response
    {
        $restaurant = Auth::user()->restaurant;

        abort_unless($restaurant, 404);

        $this->authorize('update', $restaurant);

        return Inertia::render('Restaurant/Settings', [
            'isHomeChef' => $restaurant->is_home_chef,
        ]);
    }

    public function update(UpdateRestaurantHomeChefRequest $request): RedirectResponse
    {
        $restaurant = $request->user()->restaurant;

        abort_unless($restaurant, 404);

        $this->authorize('update', $restaurant);

        $restaurant->update([
            'is_home_chef' => $request->boolean('is_home_chef'),
        ]);

        return back()->with('success', 'Restaurant type updated.');
    }

    public function updatePassword(UpdateRestaurantPasswordRequest $request): RedirectResponse
    {
        $restaurant = $request->user()->restaurant;

        abort_unless($restaurant, 404);

        $this->authorize('update', $restaurant);

        $request->user()->update([
            'password' => $request->validated('password'),
        ]);

        return back()->with('success', 'Password updated.');
    }
}
