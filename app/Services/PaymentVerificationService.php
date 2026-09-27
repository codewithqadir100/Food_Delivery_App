<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentVerificationService
{
    public function __construct(private readonly RestaurantApprovalService $approval) {}

    public function markVerified(Payment $payment, ?User $verifiedBy = null): Subscription
    {
        return DB::transaction(function () use ($payment, $verifiedBy) {
            $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();

            if ($payment->status === Payment::STATUS_VERIFIED) {
                return $payment->subscription()->firstOrFail();
            }

            if ($payment->status !== Payment::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'payment' => 'This payment cannot be verified.',
                ]);
            }

            $plan = Plan::query()->findOrFail($payment->plan_id);
            $restaurant = Restaurant::query()->whereKey($payment->restaurant_id)->lockForUpdate()->firstOrFail();
            $subscription = Subscription::query()
                ->where('restaurant_id', $restaurant->id)
                ->lockForUpdate()
                ->firstOrFail();

            $now = now();
            $base = $subscription->ends_at && $subscription->ends_at->isFuture()
                ? $subscription->ends_at->copy()
                : $now->copy();

            $subscription->fill([
                'plan_id' => $plan->id,
                'status' => Subscription::STATUS_ACTIVE,
                'starts_at' => $subscription->starts_at ?? $now,
                'ends_at' => $base->addDays((int) $plan->duration_days),
                'activated_at' => $subscription->activated_at ?? $now,
            ])->save();

            $payment->fill([
                'status' => Payment::STATUS_VERIFIED,
                'verified_at' => $now,
                'verified_by' => $verifiedBy?->id,
            ])->save();

            Payment::query()
                ->where('restaurant_id', $restaurant->id)
                ->where('status', Payment::STATUS_PENDING)
                ->whereKeyNot($payment->id)
                ->update(['status' => Payment::STATUS_FAILED]);

            $this->approval->approveIfPending($restaurant);

            return $subscription->fresh(['plan']);
        });
    }
}
