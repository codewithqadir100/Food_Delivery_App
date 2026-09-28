<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddToCartRequest;
use App\Http\Requests\Customer\UpdateCartItemRequest;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function index(): Response
    {
        return Inertia::render('Customer/Cart');
    }

    public function data(Request $request): JsonResponse
    {
        if ($request->filled('restaurant_id')) {
            return response()->json([
                'success' => true,
                'data' => $this->payload((int) $request->query('restaurant_id')),
            ]);
        }

        $carts = collect($this->cart->restaurantIds())
            ->map(fn (int $id) => $this->restaurantPayload($id))
            ->values();

        $data = [
            'carts' => $carts,
            'count' => $this->cart->count(),
        ];

        if ($carts->count() === 1) {
            $data = array_merge($carts->first(), $data);
        } else {
            $data['items'] = [];
            $data['subtotal'] = 0;
            $data['fulfillment'] = Order::FULFILLMENT_DELIVERY;
            $data['restaurant'] = null;
            $data['suggestions'] = [];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function store(AddToCartRequest $request): JsonResponse
    {
        $menuItem = MenuItem::with('restaurant')->where('is_available', true)
            ->findOrFail($request->validated('menu_item_id'));

<<<<<<< HEAD
        if (! $menuItem->restaurant?->isOrderable()) {
            return response()->json([
                'success' => false,
                'message' => 'This restaurant is currently unavailable.',
            ], 422);
        }

        $switchedRestaurant = $this->cart->addItem($menuItem, (int) ($request->validated('quantity') ?? 1));
=======
        $this->cart->addItem($menuItem, (int) ($request->validated('quantity') ?? 1));
>>>>>>> fixing/agent-fixing

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart.',
            'switched_restaurant' => false,
            'cart_count' => $this->cart->count(),
            'data' => $this->payload($menuItem->restaurant_id),
        ]);
    }

    public function updateFulfillment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fulfillment' => ['required', 'string', Rule::in(Order::FULFILLMENTS)],
            'restaurant_id' => ['required', 'integer', 'exists:restaurants,id'],
        ]);

        $this->cart->setFulfillment($validated['fulfillment'], (int) $validated['restaurant_id']);

        return response()->json([
            'success' => true,
            'data' => $this->payload((int) $validated['restaurant_id']),
        ]);
    }

    public function update(UpdateCartItemRequest $request, int $menuItem): JsonResponse
    {
        $updated = $this->cart->updateItem($menuItem, (int) $request->validated('quantity'));

        if (! $updated) {
            return response()->json([
                'success' => false,
                'message' => 'This item is not in your cart.',
            ], 404);
        }

        $restaurantId = MenuItem::query()->whereKey($menuItem)->value('restaurant_id');

        return response()->json([
            'success' => true,
            'data' => $this->payload($restaurantId ? (int) $restaurantId : null),
            'cart_count' => $this->cart->count(),
        ]);
    }

    public function destroy(int $menuItem): JsonResponse
    {
        $restaurantId = MenuItem::query()->whereKey($menuItem)->value('restaurant_id');
        $this->cart->removeItem($menuItem);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart.',
            'data' => $this->payload($restaurantId ? (int) $restaurantId : null),
            'cart_count' => $this->cart->count(),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $restaurantId = $request->filled('restaurant_id')
            ? (int) $request->query('restaurant_id')
            : null;

        $this->cart->clear($restaurantId);

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared.',
            'cart_count' => $this->cart->count(),
            'data' => $restaurantId
                ? $this->payload($restaurantId)
                : [
                    'carts' => [],
                    'items' => [],
                    'subtotal' => 0,
                    'count' => 0,
                    'fulfillment' => Order::FULFILLMENT_DELIVERY,
                    'restaurant' => null,
                    'suggestions' => [],
                ],
        ]);
    }

    private function payload(?int $restaurantId): array
    {
        $carts = collect($this->cart->restaurantIds())
            ->map(fn (int $id) => $this->restaurantPayload($id))
            ->values()
            ->all();

        $current = $restaurantId ? $this->restaurantPayload($restaurantId) : [
            'items' => [],
            'subtotal' => 0,
            'fulfillment' => Order::FULFILLMENT_DELIVERY,
            'restaurant' => null,
            'suggestions' => [],
        ];

        return array_merge($current, [
            'count' => $this->cart->count(),
            'carts' => $carts,
        ]);
    }

    private function restaurantPayload(int $restaurantId): array
    {
        return [
            'items' => $this->cart->getItems($restaurantId),
            'subtotal' => $this->cart->getSubtotal($restaurantId),
            'fulfillment' => $this->cart->getFulfillment($restaurantId),
            'suggestions' => $this->cart->suggestions($restaurantId),
            'restaurant' => Restaurant::select('id', 'name', 'logo', 'is_open', 'status')->find($restaurantId),
        ];
    }
}
