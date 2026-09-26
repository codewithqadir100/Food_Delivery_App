<?php

namespace App\Http\Controllers\Restaurant;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $restaurant = auth()->user()->restaurant;

        $query = $restaurant->menuItems()
            ->with('menuCategory')
            ->orderBy('created_at', 'desc');

        if ($request->filled('category_id')) {
            $query->where(
                'menu_category_id',
                $request->integer('category_id')
            );
        }

        $items = $query->get()->map(function (MenuItem $item) {
            $item->image = $item->image
                ? Storage::disk('public')->url($item->image)
                : null;

            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $restaurant = auth()->user()->restaurant;

        $validated = $request->validate([
            'menu_category_id' => [
                'required',
                'integer',
                Rule::exists('menu_categories', 'id')
                    ->where('restaurant_id', $restaurant->id),
            ],
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:99999.99',
            ],
            'image' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048',
            ],
        ]);

        $imagePath = $request->file('image')
            ->store('menu-items', 'public');

        try {
            $restaurant->menuItems()->create([
                'menu_category_id' => $validated['menu_category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'image' => $imagePath,
                'is_available' => true,
            ]);
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($imagePath);

            throw $exception;
        }

        return redirect()
            ->route('restaurant.menu')
            ->with('success', 'Item created successfully.');
    }

    public function update(Request $request, MenuItem $item)
    {
        $restaurant = auth()->user()->restaurant;

        $this->ensureItemBelongsToRestaurant($item, $restaurant->id);

        $validated = $request->validate([
            'menu_category_id' => [
                'required',
                'integer',
                Rule::exists('menu_categories', 'id')
                    ->where('restaurant_id', $restaurant->id),
            ],
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:99999.99',
            ],
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048',
            ],
        ]);

        $data = [
            'menu_category_id' => $validated['menu_category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
        ];

        $oldImagePath = $item->image;
        $newImagePath = null;

        if ($request->hasFile('image')) {
            $newImagePath = $request->file('image')
                ->store('menu-items', 'public');

            $data['image'] = $newImagePath;
        }

        try {
            $item->update($data);
        } catch (\Throwable $exception) {
            if ($newImagePath) {
                Storage::disk('public')->delete($newImagePath);
            }

            throw $exception;
        }

        if ($newImagePath && $oldImagePath) {
            Storage::disk('public')->delete($oldImagePath);
        }

        return redirect()
            ->route('restaurant.menu')
            ->with('success', 'Item updated successfully.');
    }

    public function destroy(MenuItem $item)
    {
        $restaurant = auth()->user()->restaurant;

        $this->ensureItemBelongsToRestaurant($item, $restaurant->id);

        $imagePath = $item->image;

        $item->delete();

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully.',
        ]);
    }

    public function toggleAvailability(MenuItem $item)
    {
        $restaurant = auth()->user()->restaurant;

        $this->ensureItemBelongsToRestaurant($item, $restaurant->id);

        $item->update([
            'is_available' => !$item->is_available,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Availability updated successfully.',
            'data' => $item->fresh()->load('menuCategory'),
        ]);
    }

    private function ensureItemBelongsToRestaurant(
        MenuItem $item,
        int $restaurantId
    ): void {
        abort_unless(
            (int) $item->restaurant_id === $restaurantId,
            403,
            'Unauthorized.'
        );
    }
}