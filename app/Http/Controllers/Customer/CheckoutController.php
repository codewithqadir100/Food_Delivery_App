<?php declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\PlaceOrderRequest;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Restaurant;
use App\Services\CartService;
use App\Services\DeliveryCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    private const BASE_DELIVERY_FEE = 100;
    private const PER_KM_FEE = 50;

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

        $restaurant = Restaurant::findOrFail($this->cart->getRestaurantId());
        $user = Auth::user();
        $addresses = $user->addresses()->orderByDesc('is_primary')->orderByDesc('created_at')->get();
        $items = $this->cart->getItems();
        $subtotal = $this->cart->getSubtotal();

        $primaryAddress = $addresses->firstWhere('is_primary', true) ?? $addresses->first();
        $deliveryFee = $this->estimateDeliveryFee($restaurant, $primaryAddress);

        return Inertia::render('Customer/Checkout', [
            'restaurant' => $restaurant,
            'items' => $items,
            'subtotal' => $subtotal,
            'addresses' => $addresses,
            'delivery_fee' => $deliveryFee,
            'has_unavailable_items' => $this->cart->hasUnavailableItems(),
        ]);
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
            ->findOrFail($request->validated('customer_address_id'));

        $restaurant = Restaurant::findOrFail($this->cart->getRestaurantId());
        $items = $this->cart->getItems();
        $subtotal = $this->cart->getSubtotal();
        $deliveryFee = $this->estimateDeliveryFee($restaurant, $address);

        $order = DB::transaction(function () use ($user, $restaurant, $address, $items, $subtotal, $deliveryFee, $request) {
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

            foreach ($items as $item) {
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

        $this->cart->clear();

        return redirect()
            ->route('customer.orders.show', $order)
            ->with('success', 'Order placed successfully! The restaurant has been notified.');
    }

    private function estimateDeliveryFee(Restaurant $restaurant, ?CustomerAddress $address): float
    {
        if (!$address || !$restaurant->latitude || !$restaurant->longitude || !$address->latitude || !$address->longitude) {
            return 0.0;
        }

        $distance = $this->deliveryService->calculateDistance(
            (float) $restaurant->latitude,
            (float) $restaurant->longitude,
            (float) $address->latitude,
            (float) $address->longitude,
        );

        return (float) $this->deliveryService->calculateDeliveryCharge(
            $distance,
            self::BASE_DELIVERY_FEE,
            self::PER_KM_FEE,
        );
    }
}
