<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\AdminVerificationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\RestaurantVerificationController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\CustomerRestaurantMenuController;
use App\Http\Controllers\Customer\RestaurantMenuController;
use App\Http\Controllers\Restaurant\DashboardController;
use App\Http\Controllers\Restaurant\RestaurantProfileController;
use App\Http\Controllers\Restaurant\MenuCategoryController;
use App\Http\Controllers\Restaurant\MenuItemController;
use App\Http\Controllers\Restaurant\MenuItemFormPageController;
use App\Http\Controllers\Restaurant\MenuController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Customer\RestaurantController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/restaurants/{restaurant}/menu', [CustomerRestaurantMenuController::class, 'show'])->name('customer.restaurant.menu');

Route::get('/restaurants', function () {
        return Inertia::render('Customer/Restaurants', [
            'categories' => \App\Models\RestaurantCategory::orderBy('name')->get(['id', 'name']),
            'user' => auth()->user(),
        ]);
    })->name('restaurants.index');

Route::middleware(['auth', 'customer'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/addresses', [AddressController::class, 'create'])->name('addresses.create');
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::post('addresses/skip', [AddressController::class, 'skip'])->name('addresses.skip');

    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::get('profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('/wishlist', [ProfileController::class, 'wishlist'])->name('wishlist');
    Route::get('/history', [ProfileController::class, 'history'])->name('history');
});

Route::middleware(['auth', 'restaurant_owner'])->prefix('restaurant')->name('restaurant.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware('approved_restaurant')->group(function () {
        Route::get('/menu', [MenuController::class, 'index'])->name('menu');
        Route::get('/menu/items/create', [MenuItemFormPageController::class, 'create'])->name('menu.items.create');
        Route::get('/menu/items/{item}/edit', [MenuItemFormPageController::class, 'edit'])->name('menu.items.edit');

        Route::prefix('menu')->group(function () {
            Route::get('categories', [MenuCategoryController::class, 'index'])->name('menu.categories.index');
            Route::post('categories', [MenuCategoryController::class, 'store'])->name('menu.categories.store');
            Route::patch('categories/{category}', [MenuCategoryController::class, 'update'])->name('menu.categories.update');
            Route::delete('categories/{category}', [MenuCategoryController::class, 'destroy'])->name('menu.categories.destroy');

            Route::get('items', [MenuItemController::class, 'index'])->name('menu.items.index');
            Route::post('items', [MenuItemController::class, 'store'])->name('menu.items.store');
            Route::patch('items/{item}', [MenuItemController::class, 'update'])->name('menu.items.update');
            Route::delete('items/{item}', [MenuItemController::class, 'destroy'])->name('menu.items.destroy');
            Route::patch('items/{item}/toggle-availability', [MenuItemController::class, 'toggleAvailability'])->name('menu.items.toggle');
        });

        Route::get('/profile', [RestaurantProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [RestaurantProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/status', [RestaurantProfileController::class, 'updateStatus'])->name('profile.update-status');
        Route::post('/profile/update-cover', [RestaurantProfileController::class, 'updateCoverImage'])->name('profile.update-cover');
        Route::post('/profile/update-logo', [RestaurantProfileController::class, 'updateLogoImage'])->name('profile.update-logo');
    });
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/restaurants/pending', [RestaurantVerificationController::class, 'index'])->name('restaurants.pending');
    Route::post('/restaurants/{restaurant}/approve', [RestaurantVerificationController::class, 'approve'])->name('restaurants.approve');
    Route::post('/restaurants/{restaurant}/reject', [RestaurantVerificationController::class, 'reject'])->name('restaurants.reject');

    Route::get('/admins/pending', [AdminVerificationController::class, 'index'])->name('admins.pending');
    Route::post('/admins/{admin}/approve', [AdminVerificationController::class, 'approve'])->name('admins.approve');
    Route::post('/admins/{admin}/reject', [AdminVerificationController::class, 'reject'])->name('admins.reject');
});

Route::prefix('api')->name('api.')->middleware('throttle:60,1')->group(function () {
    Route::get('/geocoding/search', [\App\Http\Controllers\Api\GeocodingController::class, 'search']);
    Route::get('/geocoding/reverse', [\App\Http\Controllers\Api\GeocodingController::class, 'reverse']);
});

Route::prefix('api')->name('api.')->group(function () {
    Route::get('/restaurants', [RestaurantController::class, 'index']);
    Route::get('/restaurants/search', [RestaurantController::class, 'search']);
    Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
});

Route::middleware('api')->prefix('api')->group(function () {
    Route::get('restaurants/{restaurant}/menu', [\App\Http\Controllers\Customer\RestaurantMenuController::class, 'show'])->name('api.restaurant.menu');
});

require __DIR__ . '/auth.php';