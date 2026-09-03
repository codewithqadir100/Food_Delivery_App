<?php declare(strict_types=1);

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\RestaurantAuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');

    Route::get('restaurant/login', [RestaurantAuthController::class, 'createLogin'])->name('restaurant.login');
    Route::post('restaurant/login', [RestaurantAuthController::class, 'storeLogin']);
    Route::get('restaurant/register', [RestaurantAuthController::class, 'createRegister'])->name('restaurant.register');
    Route::post('restaurant/register', [RestaurantAuthController::class, 'storeRegister']);

    Route::get('admin/login', [AdminAuthController::class, 'createLogin'])->name('admin.login');
    Route::post('admin/login', [AdminAuthController::class, 'storeLogin']);
    Route::get('admin/register', [AdminAuthController::class, 'createRegister'])->name('admin.register');
    Route::post('admin/register', [AdminAuthController::class, 'storeRegister']);
});

Route::middleware('auth')->group(function () {
    Route::put('password', [\App\Http\Controllers\Auth\PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::post('restaurant/logout', [RestaurantAuthController::class, 'destroy'])->name('restaurant.logout');
    Route::post('admin/logout', [AdminAuthController::class, 'destroy'])->name('admin.logout');
});