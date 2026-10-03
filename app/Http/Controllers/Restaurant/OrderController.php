<?php

declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\RestaurantOrderStatsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly RestaurantOrderStatsService $stats) {}

    public function index(Request $request): Response
    {
        $restaurant = Auth::user()->restaurant;

        abort_unless($restaurant, 404);

        $status = (string) $request->query('status', 'all');

        $query = $restaurant->orders()
            ->with('customer:id,name')
            ->withCount('items')
            ->latest();

        if ($status !== 'all' && $status !== '') {
            $query->where('status', $status);
        }

        $orders = $query->paginate(15)->withQueryString();

        $only = $this->partialProps($request);
        $props = [
            'orders' => $orders,
            'filters' => ['status' => $status ?: 'all'],
        ];

        if ($only === null || in_array('stats', $only, true)) {
            $props['stats'] = $this->stats->buildStats($restaurant);
        }

        if ($only === null || in_array('latest_order_id', $only, true)) {
            $props['latest_order_id'] = (int) ($restaurant->orders()->max('id') ?? 0);
        }

        return Inertia::render('Restaurant/Orders', $props);
    }

    public function feed(Request $request): JsonResponse
    {
        $restaurant = Auth::user()->restaurant;

        abort_unless($restaurant, 404);

        $orders = collect();

        if ($request->has('after_id')) {
            $afterId = max(0, (int) $request->query('after_id', 0));

            $orders = $restaurant->orders()
                ->with('customer:id,name')
                ->withCount('items')
                ->where('id', '>', $afterId)
                ->orderByDesc('id')
                ->limit(20)
                ->get()
                ->map(fn (Order $order) => $this->serializeListOrder($order))
                ->values();
        }

        $updates = collect();
        $since = Order::statusFeedSince($request->query('since'));

        if ($since) {
            $updates = $restaurant->orders()
                ->with('customer:id,name')
                ->withCount('items')
                ->where('updated_at', '>=', $since)
                ->orderByDesc('updated_at')
                ->limit(20)
                ->get()
                ->map(fn (Order $order) => $this->serializeListOrder($order))
                ->values();
        }

        return response()->json([
            'orders' => $orders,
            'updates' => $updates,
            'stats' => $this->stats->buildStats($restaurant),
            'server_time' => now()->toIso8601String(),
        ]);
    }

    public function show(Order $order): Response
    {
        $this->authorize('view', $order);

        $order->load(['items.menuItem', 'customer:id,name,email,phone', 'address']);

        return Inertia::render('Restaurant/OrderDetail', [
            'order' => $order,
            'next_statuses' => $order->nextStatuses(),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $status = $request->validated('status');

        abort_unless($order->canTransitionTo($status), 422, 'Invalid status transition.');

        $updates = ['status' => $status];

        if ($status === Order::STATUS_CONFIRMED) {
            $updates['confirmed_at'] = now();
        } elseif ($status === Order::STATUS_DELIVERED) {
            $updates['delivered_at'] = now();
        } elseif ($status === Order::STATUS_CANCELLED) {
            $updates['cancelled_at'] = now();
            $updates['cancelled_by'] = Order::CANCELLED_BY_RESTAURANT;
            $updates['cancellation_reason'] = $request->validated('cancellation_reason');
        }

        $order->update($updates);
        $order->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Order status updated.',
            'data' => $order,
            'next_statuses' => $order->nextStatuses(),
        ]);
    }

    /**
     * @return list<string>|null Null means a full visit, so every prop is needed.
     */
    private function partialProps(Request $request): ?array
    {
        $header = $request->header('X-Inertia-Partial-Data');

        if (! is_string($header) || $header === '') {
            return null;
        }

        return array_values(array_filter(array_map('trim', explode(',', $header))));
    }

    private function serializeListOrder(Order $order): array
    {
        return array_merge($order->statusSnapshot(), [
            'order_number' => $order->order_number,
            'customer_name' => $order->customer?->name ?? '—',
            'items_count' => (int) $order->items_count,
            'total' => $order->total,
            'created_at' => $order->created_at,
        ]);
    }
}
