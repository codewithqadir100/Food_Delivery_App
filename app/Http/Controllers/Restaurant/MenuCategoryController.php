<?php

namespace App\Http\Controllers\Restaurant;

use App\Models\MenuCategory;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class MenuCategoryController extends Controller
{
    public function index()
    {
        $restaurant = auth()->user()->restaurant;
        
        $categories = $restaurant->menuCategories()
            ->withCount('menuItems')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:menu_categories,name,NULL,id,restaurant_id,' . auth()->user()->restaurant_id,
        ]);

        $restaurant = auth()->user()->restaurant;

        $category = $restaurant->menuCategories()->create([
            'name' => $validated['name'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category->loadCount('menuItems')
        ], 201);
    }

    public function update(Request $request, MenuCategory $category)
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:menu_categories,name,' . $category->id . ',id,restaurant_id,' . auth()->user()->restaurant_id,
        ]);

        $category->update([
            'name' => $validated['name'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category->loadCount('menuItems')
        ]);
    }

    public function destroy(MenuCategory $category)
    {
        $this->authorize('delete', $category);

        $itemCount = $category->menuItems()->count();

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => "Category deleted successfully. {$itemCount} items were also removed.",
        ]);
    }
}