<?php declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddToCartRequest;
use App\Http\Requests\Customer\UpdateCartItemRequest;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart)
    {
    }

    public function index(): Response
    {
        $restaurantId = $this->cart->getRestaurantId();

        return Inertia::render('Customer/Cart', [
            'restaurant' => $restaurantId
                ? Restaurant::select('id', 'name', 'logo', 'is_open', 'status')->find($restaurantId)
                : null,
        ]);
    }

    public function data(): JsonResponse
    {
        $restaurantId = $this->cart->getRestaurantId();

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $this->cart->getItems(),
                'subtotal' => $this->cart->getSubtotal(),
                'restaurant' => $restaurantId
                    ? Restaurant::select('id', 'name', 'logo', 'is_open', 'status')->find($restaurantId)
                    : null,
            ],
        ]);
    }

    public function store(AddToCartRequest $request): JsonResponse
    {
        $menuItem = MenuItem::where('is_available', true)
            ->findOrFail($request->validated('menu_item_id'));

        $switchedRestaurant = $this->cart->addItem($menuItem, (int) ($request->validated('quantity') ?? 1));

        return response()->json([
            'success' => true,
            'message' => $switchedRestaurant
                ? 'Your previous cart was cleared because you added an item from a different restaurant.'
                : 'Item added to cart.',
            'switched_restaurant' => $switchedRestaurant,
            'cart_count' => $this->cart->count(),
        ]);
    }

    public function update(UpdateCartItemRequest $request, int $menuItem): JsonResponse
    {
        $this->cart->updateItem($menuItem, (int) $request->validated('quantity'));

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $this->cart->getItems(),
                'subtotal' => $this->cart->getSubtotal(),
            ],
            'cart_count' => $this->cart->count(),
        ]);
    }

    public function destroy(int $menuItem): JsonResponse
    {
        $this->cart->removeItem($menuItem);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart.',
            'data' => [
                'items' => $this->cart->getItems(),
                'subtotal' => $this->cart->getSubtotal(),
            ],
            'cart_count' => $this->cart->count(),
        ]);
    }

    public function clear(): JsonResponse
    {
        $this->cart->clear();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared.',
            'cart_count' => 0,
        ]);
    }
}
