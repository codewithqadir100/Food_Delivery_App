<?php

declare(strict_types=1);

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Models\Plan;

class PaymentGatewayResolver
{
    public function forPlan(Plan $plan): PaymentGateway
    {
        if ($plan->isFree()) {
            return app(FreePaymentProvider::class);
        }

        return match (config('services.payments.provider', 'manual')) {
            default => app(ManualPaymentProvider::class),
        };
    }
}
