<?php

declare(strict_types=1);

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Models\Payment;

class FreePaymentProvider implements PaymentGateway
{
    public function initiate(Payment $payment): Payment
    {
        $payment->fill([
            'provider' => Payment::PROVIDER_FREE,
            'status' => Payment::STATUS_PENDING,
            'amount' => 0,
        ])->save();

        return $payment;
    }
}
