<?php declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $restaurants = Restaurant::with(['user', 'restaurantCategory'])
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/VerifyRestaurants', [
            'restaurants' => $restaurants,
        ]);
    }

    public function approve(Restaurant $restaurant): RedirectResponse
    {
        DB::transaction(function () use ($restaurant) {
            $restaurant->update(['status' => 'approved']);

            $restaurant->user->update(['status' => User::STATUS_APPROVED]);
        });

        return back()->with('success', 'Restaurant approved successfully.');
    }

    public function reject(Restaurant $restaurant): RedirectResponse
    {
        DB::transaction(function () use ($restaurant) {
            $restaurant->update(['status' => 'rejected']);

            $restaurant->user->update(['status' => User::STATUS_REJECTED]);
        });

        return back()->with('success', 'Restaurant rejected.');
    }
}