<?php declare(strict_types=1);

namespace App\Services;

use App\Models\MenuItem;
use Illuminate\Support\Collection;

/**
 * Lightweight, session-backed shopping cart.
 *
 * The cart only ever holds items from a single restaurant at a time (the
 * common "one restaurant per order" rule used by most food delivery apps).
 * Prices are always re-read from the database when the cart is rendered so
 * a stale session can never show/checkout an outdated price.
 */
class CartService
{
    private const SESSION_KEY = 'cart';

    public function addItem(MenuItem $menuItem, int $quantity = 1): bool
    {
        $cart = $this->getRawCart();
        $switchedRestaurant = false;

        if ($cart['restaurant_id'] !== null && $cart['restaurant_id'] !== $menuItem->restaurant_id) {
            $cart = ['restaurant_id' => null, 'items' => []];
            $switchedRestaurant = true;
        }

        $cart['restaurant_id'] = $menuItem->restaurant_id;
        $cart['items'][$menuItem->id] = max(1, ($cart['items'][$menuItem->id] ?? 0) + $quantity);

        $this->saveRawCart($cart);

        return $switchedRestaurant;
    }

    public function updateItem(int $menuItemId, int $quantity): void
    {
        $cart = $this->getRawCart();

        if ($quantity <= 0) {
            unset($cart['items'][$menuItemId]);
        } else {
            $cart['items'][$menuItemId] = $quantity;
        }

        if (empty($cart['items'])) {
            $cart['restaurant_id'] = null;
        }

        $this->saveRawCart($cart);
    }

    public function removeItem(int $menuItemId): void
    {
        $this->updateItem($menuItemId, 0);
    }

    public function clear(): void
    {
        session()->forget(self::SESSION_KEY);
    }

    public function count(): int
    {
        return array_sum($this->getRawCart()['items']);
    }

    public function isEmpty(): bool
    {
        return empty($this->getRawCart()['items']);
    }

    public function getRestaurantId(): ?int
    {
        return $this->getRawCart()['restaurant_id'];
    }

    /**
     * Returns cart line items with fresh prices/availability from the DB.
     */
    public function getItems(): Collection
    {
        $cart = $this->getRawCart();

        if (empty($cart['items'])) {
            return collect();
        }

        $menuItems = MenuItem::whereIn('id', array_keys($cart['items']))
            ->get()
            ->keyBy('id');

        return collect($cart['items'])
            ->map(function (int $quantity, int $menuItemId) use ($menuItems) {
                $menuItem = $menuItems->get($menuItemId);

                if (!$menuItem) {
                    return null;
                }

                $price = (float) $menuItem->price;

                return [
                    'menu_item_id' => $menuItem->id,
                    'name' => $menuItem->name,
                    'image_url' => $menuItem->image_url,
                    'price' => $price,
                    'quantity' => $quantity,
                    'subtotal' => round($price * $quantity, 2),
                    'is_available' => (bool) $menuItem->is_available,
                ];
            })
            ->filter()
            ->values();
    }

    public function getSubtotal(): float
    {
        return round((float) $this->getItems()->sum('subtotal'), 2);
    }

    public function hasUnavailableItems(): bool
    {
        return $this->getItems()->contains(fn (array $item) => !$item['is_available']);
    }

    private function getRawCart(): array
    {
        $cart = session(self::SESSION_KEY, []);

        return [
            'restaurant_id' => $cart['restaurant_id'] ?? null,
            'items' => $cart['items'] ?? [],
        ];
    }

    private function saveRawCart(array $cart): void
    {
        session([self::SESSION_KEY => $cart]);
    }
}
