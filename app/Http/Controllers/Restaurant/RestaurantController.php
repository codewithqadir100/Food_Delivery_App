<?php

declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RestaurantController extends Controller
{
    public function index()
    {
        $restaurant = Auth::user()->restaurant()->with('restaurantCategory')->first();

        return Inertia::render('Restaurant/Show', [
            'restaurant' => $restaurant,
        ]);
    }

    public function create()
    {
        $this->authorize('create', Restaurant::class);

        $categories = RestaurantCategory::select('id', 'name')->get();

        return Inertia::render('Restaurant/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Restaurant::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'restaurant_category_id' => ['required', 'exists:restaurant_categories,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
            'is_open' => ['boolean'],
        ]);

        $validated['user_id'] = Auth::id();
        $validated['is_open'] = $request->boolean('is_open', false);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('restaurants/logos', 'public');
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('restaurants/covers', 'public');
        }

        $restaurant = Restaurant::create($validated);

        return redirect()->route('restaurant.profile.index')->with('success', 'Restaurant created successfully.');
    }

    public function show(Restaurant $restaurant)
    {
        $this->authorize('view', $restaurant);

        $restaurant->load('restaurantCategory');

        return Inertia::render('Restaurant/Show', [
            'restaurant' => $restaurant,
        ]);
    }

    public function edit(Restaurant $restaurant)
    {
        $this->authorize('update', $restaurant);

        $categories = RestaurantCategory::select('id', 'name')->get();

        return Inertia::render('Restaurant/Edit', [
            'restaurant' => $restaurant,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Restaurant $restaurant)
    {
        $this->authorize('update', $restaurant);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'restaurant_category_id' => ['required', 'exists:restaurant_categories,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
            'is_open' => ['boolean'],
        ]);

        $validated['is_open'] = $request->boolean('is_open', false);

        if ($request->hasFile('logo')) {
            if ($restaurant->logo) {
                Storage::disk('public')->delete($restaurant->logo);
            }
            $validated['logo'] = $request->file('logo')->store('restaurants/logos', 'public');
        }

        if ($request->hasFile('cover_image')) {
            if ($restaurant->cover_image) {
                Storage::disk('public')->delete($restaurant->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('restaurants/covers', 'public');
        }

        $restaurant->update($validated);

        return redirect()->route('restaurant.profile.index')->with('success', 'Restaurant updated successfully.');
    }

    public function destroy(Restaurant $restaurant)
    {
        $this->authorize('delete', $restaurant);

        if ($restaurant->logo) {
            Storage::disk('public')->delete($restaurant->logo);
        }

        if ($restaurant->cover_image) {
            Storage::disk('public')->delete($restaurant->cover_image);
        }

        $restaurant->delete();

        return redirect()->route('restaurant.dashboard')->with('success', 'Restaurant deleted successfully.');
    }
}