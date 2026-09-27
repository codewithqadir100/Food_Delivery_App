<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentVerificationController extends Controller
{
    public function __construct(private readonly PaymentVerificationService $verification) {}

    public function index(): Response
    {
        $payments = Payment::query()
            ->with(['restaurant', 'plan'])
            ->where('status', Payment::STATUS_PENDING)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/VerifyPayments', [
            'payments' => $payments,
        ]);
    }

    public function verify(Request $request, Payment $payment): RedirectResponse
    {
        abort_unless($payment->status === Payment::STATUS_PENDING, 403);

        $this->verification->markVerified($payment, $request->user());

        return back()->with('success', 'Payment verified. The restaurant subscription is now active.');
    }
}
