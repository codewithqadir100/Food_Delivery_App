<?php declare(strict_types=1);

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
    ) {
    }

    public function show(): Response|RedirectResponse
    {
        if ($this->cart->isEmpty()) {
            return redirect()->route('customer.cart.index')
                ->with('error', 'Your cart is empty. Add items before checking out.');
        }

        $restaurant = Restaurant::find($this->cart->getRestaurantId());

        if (!$restaurant) {
            $this->cart->clear();

            return redirect()->route('customer.cart.index')
                ->with('error', 'The restaurant for this order is no longer available.');
        }

        $user = Auth::user();
        $addresses = $user->addresses()->orderByDesc('is_primary')->orderByDesc('created_at')->get();
        $items = $this->cart->getItems();
        $subtotal = $this->cart->getSubtotal();

        $primaryAddress = $addresses->firstWhere('is_primary', true) ?? $addresses->first();
        $deliveryEstimate = $primaryAddress ? $this->estimateDeliveryFee($restaurant, $primaryAddress) : null;

        return Inertia::render('Customer/Checkout', [
            'restaurant' => $restaurant,
            'items' => $items,
            'subtotal' => $subtotal,
            'addresses' => $addresses,
            'delivery_fee' => $deliveryEstimate['valid'] ?? false ? $deliveryEstimate['fee'] : null,
            'delivery_error' => $deliveryEstimate && !$deliveryEstimate['valid'] ? $deliveryEstimate['error'] : null,
            'has_unavailable_items' => $this->cart->hasUnavailableItems(),
            'restaurant_unavailable' => !$restaurant->isApproved() || !$restaurant->is_open,
        ]);
    }

    public function deliveryFee(Request $request): JsonResponse
    {
        $restaurant = Restaurant::find($this->cart->getRestaurantId());

        if (!$restaurant) {
            return response()->json(['valid' => false, 'error' => 'Restaurant not found.'], 404);
        }

        $address = CustomerAddress::where('customer_id', Auth::id())
            ->find($request->query('customer_address_id'));

        if (!$address) {
            return response()->json(['valid' => false, 'error' => 'Address not found.'], 404);
        }

        $estimate = $this->estimateDeliveryFee($restaurant, $address);

        return response()->json($estimate);
    }

    public function store(PlaceOrderRequest $request): RedirectResponse
    {
        if ($this->cart->isEmpty()) {
            return redirect()->route('customer.cart.index')->with('error', 'Your cart is empty.');
        }

        if ($this->cart->hasUnavailableItems()) {
            return back()->with('error', 'Some items in your cart are no longer available. Please review your cart.');
        }

        $user = Auth::user();
        $address = CustomerAddress::where('customer_id', $user->id)
            ->find($request->validated('customer_address_id'));

        if (!$address) {
            return back()->with('error', 'Please select a valid delivery address.');
        }

        $restaurant = Restaurant::find($this->cart->getRestaurantId());

        if (!$restaurant) {
            $this->cart->clear();

            return redirect()->route('customer.cart.index')
                ->with('error', 'The restaurant for this order is no longer available.');
        }

        $items = $this->cart->getItems();

        try {
            $order = DB::transaction(function () use ($user, $restaurant, $address, $items, $request) {
                $restaurant->refresh();

                $this->assertRestaurantCanReceiveOrders($restaurant);

                $freshItems = $this->reverifyItems($restaurant, $items);
                $subtotal = round((float) $freshItems->sum('subtotal'), 2);

                $deliveryEstimate = $this->estimateDeliveryFee($restaurant, $address);

                if (!$deliveryEstimate['valid']) {
                    throw new RuntimeException($deliveryEstimate['error']);
                }

                $deliveryFee = $deliveryEstimate['fee'];

                $order = Order::create([
                    'customer_id' => $user->id,
                    'restaurant_id' => $restaurant->id,
                    'customer_address_id' => $address->id,
                    'status' => Order::STATUS_PENDING,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $deliveryFee,
                    'total' => round($subtotal + $deliveryFee, 2),
                    'delivery_address' => implode(', ', array_filter([
                        $address->street_address,
                        $address->area_name,
                        $address->city_name,
                    ])),
                    'notes' => $request->validated('notes'),
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

        $this->cart->clear();

        OrderPlaced::dispatch($order);

        return redirect()
            ->route('customer.orders.show', $order)
            ->with('success', 'Order placed successfully! The restaurant has been notified.');
    }

    private function assertRestaurantCanReceiveOrders(Restaurant $restaurant): void
    {
        if (!$restaurant->isApproved()) {
            throw new RuntimeException('This restaurant is not currently accepting orders.');
        }

        if (!$restaurant->is_open) {
            throw new RuntimeException('This restaurant is currently closed. Please try again later.');
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
        if (!$restaurant->latitude || !$restaurant->longitude) {
            return ['valid' => false, 'error' => 'This restaurant has not configured its delivery location yet.'];
        }

        if (!$address->latitude || !$address->longitude) {
            return ['valid' => false, 'error' => 'Your selected address is missing location coordinates.'];
        }

        $validation = $this->deliveryService->validateDeliveryLocation(
            (float) $restaurant->latitude,
            (float) $restaurant->longitude,
            (int) $restaurant->service_radius_km,
            (float) $address->latitude,
            (float) $address->longitude,
        );

        if (!$validation['valid']) {
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
