<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Restaurant\DashboardController;
use App\Http\Controllers\Restaurant\RestaurantController;

use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'customer'])->group(function () {
    Route::get('/customer/dashboard', function () {
        return Inertia::render('Customer/Dashboard');
    })->name('customer.dashboard');
});

Route::middleware(['auth', 'restaurant_owner'])->prefix('restaurant')->name('restaurant.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [RestaurantController::class, 'index'])->name('profile.index');
    Route::get('/profile/create', [RestaurantController::class, 'create'])->name('profile.create');
    Route::post('/profile', [RestaurantController::class, 'store'])->name('profile.store');
    Route::get('/profile/{restaurant}', [RestaurantController::class, 'show'])->name('profile.show');
    Route::get('/profile/{restaurant}/edit', [RestaurantController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/{restaurant}', [RestaurantController::class, 'update'])->name('profile.update');
    Route::delete('/profile/{restaurant}', [RestaurantController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');
});

require __DIR__.'/auth.php';