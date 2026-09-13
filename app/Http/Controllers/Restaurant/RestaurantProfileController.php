<?php

declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\RestaurantProfileRequest;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantProfileController extends Controller
{
    public function edit(): Response
    {
        $restaurant = Auth::user()->restaurant;

        abort_unless($restaurant, 404);

        $this->authorize('view', $restaurant);

        return Inertia::render('Restaurant/Profile', [
            'restaurant' => $restaurant,
        ]);
    }

    public function update(RestaurantProfileRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $restaurant = $user->restaurant;

        abort_unless($restaurant, 404);

        $this->authorize('update', $restaurant);

        $validated = $request->validated();

        DB::transaction(function () use ($request, $user, $restaurant, $validated) {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $restaurantData = [
                'name' => $validated['name'],
                'city' => $validated['city'],
                'address' => $validated['address'],
                'phone' => $validated['phone'] ?? null,
                'description' => $validated['description'] ?? null,
                'is_open' => $validated['is_open'],
            ];

            if ($request->hasFile('logo')) {
                if ($restaurant->logo) {
                    Storage::disk('public')->delete($restaurant->logo);
                }

                $restaurantData['logo'] = $request->file('logo')
                    ->store('restaurants/logos', 'public');
            }

            if ($request->hasFile('cover_image')) {
                if ($restaurant->cover_image) {
                    Storage::disk('public')->delete($restaurant->cover_image);
                }

                $restaurantData['cover_image'] = $request->file('cover_image')
                    ->store('restaurants/covers', 'public');
            }

            $restaurant->update($restaurantData);
        });

        return back()->with('success', 'Restaurant profile updated successfully.');
    }
}
