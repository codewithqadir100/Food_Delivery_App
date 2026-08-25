<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
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

Route::middleware(['auth', 'restaurant_owner'])->group(function () {
    Route::get('/restaurant/dashboard', function () {
        return Inertia::render('Restaurant/Dashboard');
    })->name('restaurant.dashboard');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');
});

require __DIR__.'/auth.php';