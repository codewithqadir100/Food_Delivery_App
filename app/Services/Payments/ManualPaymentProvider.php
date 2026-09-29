<?php

declare(strict_types=1);

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Models\Payment;

class ManualPaymentProvider implements PaymentGateway
{
    public function initiate(Payment $payment): Payment
    {
        $payment->fill([
            'provider' => Payment::PROVIDER_MANUAL,
            'status' => Payment::STATUS_PENDING,
        ])->save();

        return $payment;
    }
}
