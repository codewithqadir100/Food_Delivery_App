<?php

declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(private readonly SubscriptionService $subscriptions) {}

    public function index(Request $request): Response
    {
        $restaurant = $request->user()->restaurant;

        return Inertia::render('Restaurant/Subscription', [
            'plans' => Plan::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'subscription' => $restaurant->subscription()->with('plan')->first(),
            'pendingPayment' => $restaurant->payments()
                ->with('plan')
                ->where('status', Payment::STATUS_PENDING)
                ->latest('id')
                ->first(),
            'freeUsed' => $this->subscriptions->hasUsedFreePlan($restaurant),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', Rule::in([Plan::CODE_FREE, Plan::CODE_NORMAL, Plan::CODE_FEATURED])],
        ]);

        $subscription = $this->subscriptions->start($request->user()->restaurant, $validated['plan']);

        $message = $subscription->isCurrentlyActive()
            ? 'Your subscription is active.'
            : 'Payment request submitted. Your restaurant goes live after the payment is verified.';

        return redirect()->route('restaurant.subscription.index')->with('success', $message);
    }
}
