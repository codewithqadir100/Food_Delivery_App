<?php declare(strict_types=1);

use App\Http\Controllers\Admin\AdminVerificationController;
use App\Http\Controllers\Admin\RestaurantVerificationController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Restaurant\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::middleware(['auth', 'customer'])->group(function () {
    Route::get('/customer/profile', [ProfileController::class, 'index'])->name('customer.profile.index');
    Route::get('/customer/profile/edit', [ProfileController::class, 'edit'])->name('customer.profile.edit');
    Route::patch('/customer/profile', [ProfileController::class, 'update'])->name('customer.profile.update');
    Route::get('/customer/wishlist', [ProfileController::class, 'wishlist'])->name('customer.wishlist');
    Route::get('/customer/history', [ProfileController::class, 'history'])->name('customer.history');
    Route::get('/customer/addresses', [ProfileController::class, 'addresses'])->name('customer.addresses');
});

Route::middleware(['auth', 'restaurant_owner'])->prefix('restaurant')->name('restaurant.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            return Inertia::render('Admin/Dashboard');
        }

        if ($user->isPending()) {
            return Inertia::render('Admin/PendingDashboard');
        }

        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/restaurants/pending', [RestaurantVerificationController::class, 'index'])->name('restaurants.pending');
    Route::post('/restaurants/{restaurant}/approve', [RestaurantVerificationController::class, 'approve'])->name('restaurants.approve');
    Route::post('/restaurants/{restaurant}/reject', [RestaurantVerificationController::class, 'reject'])->name('restaurants.reject');

    Route::get('/admins/pending', [AdminVerificationController::class, 'index'])->name('admins.pending');
    Route::post('/admins/{admin}/approve', [AdminVerificationController::class, 'approve'])->name('admins.approve');
    Route::post('/admins/{admin}/reject', [AdminVerificationController::class, 'reject'])->name('admins.reject');
});

require __DIR__.'/auth.php';