<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CancelOrderRequest;
use App\Models\Order;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly ReviewService $reviews) {}

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('customer_id', Auth::id())
            ->with(['restaurant:id,name,logo'])
            ->withCount('items')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customer/History', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $this->authorize('view', $order);

        $order->load(['items.menuItem', 'restaurant', 'address', 'review']);

        return Inertia::render('Customer/OrderDetail', [
            'order' => $order,
            'can_review' => $this->reviews->canWrite($order, $request->user()),
        ]);
    }

    public function feed(Request $request): JsonResponse
    {
        $since = Order::statusFeedSince($request->query('since'));

        $orders = collect();

        if ($since) {
            $orders = Order::query()
                ->where('customer_id', Auth::id())
                ->where('updated_at', '>=', $since)
                ->orderByDesc('updated_at')
                ->limit(20)
                ->get()
                ->map(fn (Order $order) => $order->statusSnapshot())
                ->values();
        }

        return response()->json([
            'orders' => $orders,
            'server_time' => now()->toIso8601String(),
        ]);
    }

    public function cancel(CancelOrderRequest $request, Order $order): JsonResponse
    {
        $this->authorize('cancel', $order);

        $updated = Order::query()
            ->whereKey($order->id)
            ->where('customer_id', $request->user()->id)
            ->whereIn('status', Order::CUSTOMER_CANCELLABLE_STATUSES)
            ->update([
                'status' => Order::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'cancelled_by' => Order::CANCELLED_BY_CUSTOMER,
                'cancellation_reason' => trim($request->validated('cancellation_reason')),
                'updated_at' => now(),
            ]);

        abort_unless($updated === 1, 422, 'This order can no longer be cancelled.');

        $order->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled.',
            'data' => $order->statusSnapshot(),
        ]);
    }
}
