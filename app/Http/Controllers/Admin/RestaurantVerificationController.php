<?php declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $restaurants = Restaurant::with(['user', 'restaurantCategory'])
            ->where('status', Restaurant::STATUS_PENDING)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/VerifyRestaurants', [
            'restaurants' => $restaurants,
        ]);
    }

    public function approve(Restaurant $restaurant): RedirectResponse
    {
        abort_unless($restaurant->isPending(), 403, 'This restaurant is not pending review.');

        DB::transaction(function () use ($restaurant) {
            $restaurant->update([
                'status' => Restaurant::STATUS_APPROVED,
                'approved_since' => now(),
            ]);

            $restaurant->user->update(['status' => User::STATUS_APPROVED]);
        });

        return back()->with('success', 'Restaurant approved successfully.');
    }

    public function reject(Restaurant $restaurant): RedirectResponse
    {
        abort_unless($restaurant->isPending(), 403, 'This restaurant is not pending review.');

        DB::transaction(function () use ($restaurant) {
            $restaurant->update(['status' => Restaurant::STATUS_REJECTED]);

            $restaurant->user->update(['status' => User::STATUS_REJECTED]);
        });

        return back()->with('success', 'Restaurant rejected.');
    }
}