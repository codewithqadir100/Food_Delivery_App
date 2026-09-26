<?php

namespace App\Http\Controllers\Restaurant;

use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $restaurant = auth()->user()->restaurant;
        $categoryId = $request->query('category_id');

        $query = $restaurant->menuItems()
            ->with('menuCategory')
            ->orderBy('created_at', 'desc');

        if ($categoryId) {
            $query->where('menu_category_id', $categoryId);
        }

        $items = $query->get();

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_category_id' => 'required|exists:menu_categories,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0|max:99999.99',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $restaurant = auth()->user()->restaurant;
        
        $category = MenuCategory::findOrFail($validated['menu_category_id']);
        if ($category->restaurant_id !== $restaurant->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $imagePath = $request->file('image')->store('menu-items', 'public');

        $item = $restaurant->menuItems()->create([
            'menu_category_id' => $validated['menu_category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image' => $imagePath,
            'is_available' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully',
            'data' => $item->load('menuCategory')
        ], 201);
    }

    public function update(Request $request, MenuItem $item)
    {
        $this->authorize('update', $item);

        $validated = $request->validate([
            'menu_category_id' => 'required|exists:menu_categories,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0|max:99999.99',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $category = MenuCategory::findOrFail($validated['menu_category_id']);
        if ($category->restaurant_id !== auth()->user()->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $data = [
            'menu_category_id' => $validated['menu_category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
        ];

        if ($request->hasFile('image')) {
            if ($item->image && Storage::disk('public')->exists($item->image)) {
                Storage::disk('public')->delete($item->image);
            }
            $data['image'] = $request->file('image')->store('menu-items', 'public');
        }

        $item->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => $item->load('menuCategory')
        ]);
    }

    public function destroy(MenuItem $item)
    {
        $this->authorize('delete', $item);

        if ($item->image && Storage::disk('public')->exists($item->image)) {
            Storage::disk('public')->delete($item->image);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully'
        ]);
    }

    public function toggleAvailability(MenuItem $item)
    {
        $this->authorize('update', $item);

        $item->update([
            'is_available' => !$item->is_available
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Availability updated',
            'data' => $item
        ]);
    }
}