<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Events\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\PlaceOrderRequest;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Restaurant;
use App\Services\CartService;
use App\Services\DeliveryCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly DeliveryCalculationService $deliveryService,
    ) {}

    public function show(?Restaurant $restaurant = null): Response|RedirectResponse
    {
        $restaurant = $this->resolveRestaurant($restaurant);

        if (! $restaurant) {
            return $this->redirectForMissingRestaurant(
                'Your cart is empty. Add items before checking out.',
            );
        }

        if ($this->cart->isEmpty($restaurant->id)) {
            return redirect()->route('customer.cart.index')
                ->with('error', 'Your cart is empty. Add items before checking out.');
        }

        $user = Auth::user();
        $requiresLogin = $user === null;
        $addresses = $requiresLogin
            ? collect()
            : $user->addresses()->orderByDesc('is_primary')->orderByDesc('created_at')->get();
        $items = $this->cart->getItems($restaurant->id);
        $subtotal = $this->cart->getSubtotal($restaurant->id);

        $primaryAddress = $addresses->firstWhere('is_primary', true) ?? $addresses->first();
        $deliveryEstimate = $primaryAddress ? $this->estimateDeliveryFee($restaurant, $primaryAddress) : null;

        $isPickup = $this->cart->isPickup($restaurant->id);

        return Inertia::render('Customer/Checkout', [
            'restaurant' => $restaurant,
            'items' => $items,
            'subtotal' => $subtotal,
            'addresses' => $addresses,
            'fulfillment' => $this->cart->getFulfillment($restaurant->id),
            'delivery_fee' => $isPickup ? 0 : ($deliveryEstimate['valid'] ?? false ? $deliveryEstimate['fee'] : null),
            'delivery_error' => $isPickup || ! $deliveryEstimate || $deliveryEstimate['valid'] ? null : $deliveryEstimate['error'],
            'has_unavailable_items' => $this->cart->hasUnavailableItems($restaurant->id),
            'restaurant_unavailable' => ! $restaurant->isOrderable(),
            'requires_login' => $requiresLogin,
        ]);
    }

    public function redirectToLogin(Restaurant $restaurant): RedirectResponse
    {
        if (Auth::user()?->isCustomer()) {
            return redirect()->route('customer.checkout.show', $restaurant);
        }

        redirect()->setIntendedUrl(route('customer.checkout.show', $restaurant));

        return redirect()->route('login');
    }

    public function deliveryFee(Request $request): JsonResponse
    {
        $restaurantId = $request->filled('restaurant_id')
            ? (int) $request->query('restaurant_id')
            : $this->cart->soleRestaurantId();
        $restaurant = $restaurantId ? Restaurant::find($restaurantId) : null;

        if (! $restaurant) {
            return response()->json(['valid' => false, 'error' => 'Restaurant not found.'], 404);
        }

        $address = CustomerAddress::where('customer_id', Auth::id())
            ->find($request->query('customer_address_id'));

        if (! $address) {
            return response()->json(['valid' => false, 'error' => 'Address not found.'], 404);
        }

        $estimate = $this->estimateDeliveryFee($restaurant, $address);

        return response()->json($estimate);
    }

    public function store(PlaceOrderRequest $request, ?Restaurant $restaurant = null): RedirectResponse
    {
        $restaurant = $this->resolveRestaurant($restaurant);

        if (! $restaurant) {
            return $this->redirectForMissingRestaurant('Your cart is empty.');
        }

        if ($this->cart->isEmpty($restaurant->id)) {
            return redirect()->route('customer.cart.index')->with('error', 'Your cart is empty.');
        }

        if ($this->cart->hasUnavailableItems($restaurant->id)) {
            return back()->with('error', 'Some items in your cart are no longer available. Please review your cart.');
        }

        $user = Auth::user();
        $isPickup = $this->cart->isPickup($restaurant->id);
        $address = null;

        if (! $isPickup) {
            $address = CustomerAddress::where('customer_id', $user->id)
                ->find($request->validated('customer_address_id'));

            if (! $address) {
                return back()->with('error', 'Please select a valid delivery address.');
            }
        }

        $items = $this->cart->getItems($restaurant->id);
        $wantsCutlery = $this->cart->wantsCutlery($restaurant->id);

        try {
            $order = DB::transaction(function () use ($user, $restaurant, $address, $items, $request, $isPickup, $wantsCutlery) {
                $restaurant->refresh();

                $this->assertRestaurantCanReceiveOrders($restaurant);

                $freshItems = $this->reverifyItems($restaurant, $items);
                $subtotal = round((float) $freshItems->sum('subtotal'), 2);

                if ($isPickup) {
                    $deliveryFee = 0.0;
                    $addressId = null;
                    $deliveryAddress = null;
                } else {
                    $deliveryEstimate = $this->estimateDeliveryFee($restaurant, $address);

                    if (! $deliveryEstimate['valid']) {
                        throw new RuntimeException($deliveryEstimate['error']);
                    }

                    $deliveryFee = $deliveryEstimate['fee'];
                    $addressId = $address->id;
                    $deliveryAddress = implode(', ', array_filter([
                        $address->street_address,
                        $address->area_name,
                        $address->city_name,
                    ]));
                }

                $order = Order::create([
                    'customer_id' => $user->id,
                    'restaurant_id' => $restaurant->id,
                    'customer_address_id' => $addressId,
                    'status' => Order::STATUS_PENDING,
                    'fulfillment_type' => $isPickup ? Order::FULFILLMENT_PICKUP : Order::FULFILLMENT_DELIVERY,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $deliveryFee,
                    'total' => round($subtotal + $deliveryFee, 2),
                    'delivery_address' => $deliveryAddress,
                    'notes' => $request->validated('notes'),
                    'wants_cutlery' => $wantsCutlery,
                ]);

                foreach ($freshItems as $item) {
                    $order->items()->create([
                        'menu_item_id' => $item['menu_item_id'],
                        'name' => $item['name'],
                        'price' => $item['price'],
                        'quantity' => $item['quantity'],
                        'subtotal' => $item['subtotal'],
                    ]);
                }

                return $order;
            });
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $this->cart->clear($restaurant->id);

        OrderPlaced::dispatch($order);

        return redirect()
            ->route('customer.orders.show', $order)
            ->with('success', 'Order placed successfully! The restaurant has been notified.');
    }

    private function redirectForMissingRestaurant(string $emptyMessage): RedirectResponse
    {
        $soleId = $this->cart->soleRestaurantId();

        if ($soleId !== null) {
            $this->cart->clear($soleId);

            return redirect()->route('customer.cart.index')
                ->with('error', 'The restaurant for this order is no longer available.');
        }

        return redirect()->route('customer.cart.index')->with('error', $emptyMessage);
    }

    private function resolveRestaurant(?Restaurant $restaurant): ?Restaurant
    {
        if ($restaurant) {
            return $restaurant;
        }

        $id = $this->cart->soleRestaurantId();

        return $id ? Restaurant::find($id) : null;
    }

    private function assertRestaurantCanReceiveOrders(Restaurant $restaurant): void
    {
        if (! $restaurant->isOrderable()) {
            throw new RuntimeException('This restaurant is currently unavailable.');
        }
    }

    private function reverifyItems(Restaurant $restaurant, Collection $items): Collection
    {
        if ($items->isEmpty()) {
            throw new RuntimeException('Your cart is empty.');
        }

        $menuItemIds = $items->pluck('menu_item_id');
        $freshMenuItems = $restaurant->menuItems()
            ->whereIn('id', $menuItemIds)
            ->where('is_available', true)
            ->get()
            ->keyBy('id');

        if ($freshMenuItems->count() !== $menuItemIds->unique()->count()) {
            throw new RuntimeException('Some items in your cart are no longer available. Please review your cart.');
        }

        return $items->map(function (array $item) use ($freshMenuItems) {
            $menuItem = $freshMenuItems->get($item['menu_item_id']);
            $price = (float) $menuItem->price;
            $quantity = (int) $item['quantity'];

            return [
                'menu_item_id' => $menuItem->id,
                'name' => $menuItem->name,
                'price' => $price,
                'quantity' => $quantity,
                'subtotal' => round($price * $quantity, 2),
            ];
        });
    }

    private function estimateDeliveryFee(Restaurant $restaurant, CustomerAddress $address): array
    {
        if (! $restaurant->latitude || ! $restaurant->longitude) {
            return ['valid' => false, 'error' => 'This restaurant has not configured its delivery location yet.'];
        }

        if (! $address->latitude || ! $address->longitude) {
            return ['valid' => false, 'error' => 'Your selected address is missing location coordinates.'];
        }

        $validation = $this->deliveryService->validateDeliveryLocation(
            (float) $restaurant->latitude,
            (float) $restaurant->longitude,
            (int) $restaurant->service_radius_km,
            (float) $address->latitude,
            (float) $address->longitude,
        );

        if (! $validation['valid']) {
            return [
                'valid' => false,
                'error' => $validation['error'] === 'Delivery location is outside service zone'
                    ? 'This address is outside the restaurant\'s delivery area.'
                    : $validation['error'],
            ];
        }

        $distance = $this->deliveryService->calculateDistance(
            (float) $restaurant->latitude,
            (float) $restaurant->longitude,
            (float) $address->latitude,
            (float) $address->longitude,
        );

        return [
            'valid' => true,
            'fee' => (float) $this->deliveryService->calculateDeliveryCharge($distance),
            'distance' => $distance,
        ];
    }
}
