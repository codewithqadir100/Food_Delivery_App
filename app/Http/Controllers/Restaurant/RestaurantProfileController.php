<?php

declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\RestaurantProfileRequest;
use App\Http\Requests\Restaurant\UpdateRestaurantCoverImageRequest;
use App\Http\Requests\Restaurant\UpdateRestaurantLogoRequest;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use Illuminate\Http\JsonResponse;
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
            'categories' => RestaurantCategory::query()
            ->orderBy('name')
            ->get(['id', 'name']),
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
                'category' => $validated['restaurant_category_id'],
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

    public function updateCoverImage(UpdateRestaurantCoverImageRequest $request): JsonResponse
    {
        $user = Auth::user();
        $restaurant = $user->restaurant;

        abort_unless($restaurant, 404);

        $this->authorize('update', $restaurant);

        try {
            DB::transaction(function () use ($request, $restaurant) {
                if ($restaurant->cover_image) {
                    Storage::disk('public')->delete($restaurant->cover_image);
                }

                $path = $request->file('cover_image')
                    ->store('restaurants/covers', 'public');

                $restaurant->update(['cover_image' => $path]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Cover image updated successfully',
                'cover_image_url' => $restaurant->cover_image_url,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cover image',
            ], 500);
        }
    }

    public function updateLogoImage(UpdateRestaurantLogoRequest $request): JsonResponse
    {
        $user = Auth::user();
        $restaurant = $user->restaurant;

        abort_unless($restaurant, 404);

        $this->authorize('update', $restaurant);

        try {
            DB::transaction(function () use ($request, $restaurant) {
                if ($restaurant->logo) {
                    Storage::disk('public')->delete($restaurant->logo);
                }

                $path = $request->file('logo')
                    ->store('restaurants/logos', 'public');

                $restaurant->update(['logo' => $path]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Logo updated successfully',
                'logo_url' => $restaurant->logo_url,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update logo',
            ], 500);
        }
    }
}