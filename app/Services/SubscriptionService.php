<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Services\Payments\PaymentGatewayResolver;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubscriptionService
{
    public function __construct(
        private readonly RestaurantOnboardingService $onboarding,
        private readonly PaymentGatewayResolver $gateways,
        private readonly PaymentVerificationService $verification,
    ) {}

    public function start(Restaurant $restaurant, string $planCode): Subscription
    {
        $restaurant->loadMissing('user');

        if (! $this->onboarding->status($restaurant)['complete']) {
            throw ValidationException::withMessages([
                'plan' => 'Complete your profile, location, and menu before choosing a plan.',
            ]);
        }

        if ($restaurant->isRejected() || $restaurant->user?->isRejected()) {
            throw ValidationException::withMessages([
                'plan' => 'This restaurant cannot subscribe.',
            ]);
        }

        $plan = Plan::query()
            ->where('code', $planCode)
            ->where('is_active', true)
            ->first();

        if (! $plan) {
            throw ValidationException::withMessages([
                'plan' => 'This plan is not available.',
            ]);
        }

        return DB::transaction(function () use ($restaurant, $plan) {
            if ($plan->isFree() && $this->hasUsedFreePlan($restaurant)) {
                throw ValidationException::withMessages([
                    'plan' => 'The free plan can only be used once.',
                ]);
            }

            $subscription = Subscription::query()->firstOrNew([
                'restaurant_id' => $restaurant->id,
            ]);

            if (! $subscription->exists || $subscription->activated_at === null) {
                $subscription->fill([
                    'plan_id' => $plan->id,
                    'status' => Subscription::STATUS_PENDING_PAYMENT,
                ])->save();
            }

            $payment = Payment::query()
                ->where('restaurant_id', $restaurant->id)
                ->where('status', Payment::STATUS_PENDING)
                ->latest('id')
                ->first() ?? new Payment([
                    'restaurant_id' => $restaurant->id,
                    'currency' => $plan->currency,
                ]);

            $payment->fill([
                'subscription_id' => $subscription->id,
                'plan_id' => $plan->id,
                'amount' => $plan->price_amount,
                'currency' => $plan->currency,
            ]);

            $this->gateways->forPlan($plan)->initiate($payment);

            if ($plan->isFree()) {
                return $this->verification->markVerified($payment->fresh());
            }

            return $subscription->fresh(['plan']);
        });
    }

    public function hasUsedFreePlan(Restaurant $restaurant): bool
    {
        return Payment::query()
            ->where('restaurant_id', $restaurant->id)
            ->where('status', Payment::STATUS_VERIFIED)
            ->whereHas('plan', fn ($query) => $query->where('code', Plan::CODE_FREE))
            ->exists();
    }
}
