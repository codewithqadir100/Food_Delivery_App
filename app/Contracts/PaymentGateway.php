<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Payment;

interface PaymentGateway
{
    public function initiate(Payment $payment): Payment;
}
