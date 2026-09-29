<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\RestaurantApprovalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantVerificationController extends Controller
{
    public function __construct(private readonly RestaurantApprovalService $approval) {}

    public function index(Request $request): Response
    {
        $restaurants = Restaurant::query()
            ->with(['user', 'restaurantCategory', 'subscription.plan'])
            ->withCount('orders')
            ->orderByRaw("case status when 'approved' then 0 when 'pending' then 1 else 2 end")
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/VerifyRestaurants', [
            'restaurants' => $restaurants,
        ]);
    }

    public function approve(Restaurant $restaurant): RedirectResponse
    {
        abort_if($restaurant->isApproved(), 403, 'This restaurant is already approved.');

        $this->approval->approve($restaurant);

        return back()->with('success', 'Restaurant approved successfully.');
    }

    public function reject(Restaurant $restaurant): RedirectResponse
    {
        abort_if($restaurant->isRejected(), 403, 'This restaurant is already rejected.');

        $this->approval->reject($restaurant);

        return back()->with('success', 'Restaurant rejected.');
    }

    public function destroy(Restaurant $restaurant): RedirectResponse
    {
        if ($restaurant->orders()->exists()) {
            return back()->with('error', 'This restaurant has orders and cannot be deleted. Reject it instead.');
        }

        DB::transaction(function () use ($restaurant) {
            $user = $restaurant->user;
            $restaurant->delete();

            $user?->forceFill([
                'status' => User::STATUS_BANNED,
            ])->save();
        });

        return back()->with('success', 'Restaurant deleted.');
    }
}
