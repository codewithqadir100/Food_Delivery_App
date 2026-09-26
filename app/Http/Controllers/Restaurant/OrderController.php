<?php declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\UpdateOrderStatusRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
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

        return Inertia::render('Restaurant/Orders', [
            'orders' => $orders,
            'filters' => ['status' => $status ?: 'all'],
            'stats' => $this->buildStats($restaurant),
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

    private function buildStats($restaurant): array
    {
        return [
            'pending' => $restaurant->orders()->where('status', Order::STATUS_PENDING)->count(),
            'active' => $restaurant->orders()->whereIn('status', Order::ACTIVE_STATUSES)->count(),
            'delivered_today' => $restaurant->orders()
                ->where('status', Order::STATUS_DELIVERED)
                ->whereDate('delivered_at', today())
                ->count(),
            'revenue_today' => (float) $restaurant->orders()
                ->where('status', Order::STATUS_DELIVERED)
                ->whereDate('delivered_at', today())
                ->sum('total'),
        ];
    }
}
