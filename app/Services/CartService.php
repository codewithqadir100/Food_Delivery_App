<?php declare(strict_types=1);

namespace App\Services;

use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Support\Collection;

/**
 * Session carts, one per restaurant. Prices are re-read from the database
 * whenever a cart is rendered.
 */
class CartService
{
    private const SESSION_KEY = 'cart';

    public function addItem(MenuItem $menuItem, int $quantity = 1): bool
    {
        $carts = $this->carts();
        $key = (string) $menuItem->restaurant_id;
        $cart = $carts[$key] ?? $this->emptyCart($menuItem->restaurant_id);

        $cart['items'][$menuItem->id] = max(1, ($cart['items'][$menuItem->id] ?? 0) + $quantity);
        $carts[$key] = $cart;
        $this->saveCarts($carts);

        return false;
    }

    public function updateItem(int $menuItemId, int $quantity): bool
    {
        $carts = $this->carts();
        $key = $this->keyForItem($carts, $menuItemId);

        if ($key === null) {
            return false;
        }

        if ($quantity <= 0) {
            unset($carts[$key]['items'][$menuItemId]);
        } else {
            $carts[$key]['items'][$menuItemId] = $quantity;
        }

        if (empty($carts[$key]['items'])) {
            unset($carts[$key]);
        }

        $this->saveCarts($carts);

        return true;
    }

    public function removeItem(int $menuItemId): void
    {
        $this->updateItem($menuItemId, 0);
    }

    public function clear(?int $restaurantId = null): void
    {
        if ($restaurantId === null) {
            session()->forget(self::SESSION_KEY);

            return;
        }

        $carts = $this->carts();
        unset($carts[(string) $restaurantId]);
        $this->saveCarts($carts);
    }

    public function count(): int
    {
        return array_sum(array_map(
            fn (array $cart) => array_sum($cart['items'] ?? []),
            $this->carts(),
        ));
    }

    public function isEmpty(?int $restaurantId = null): bool
    {
        if ($restaurantId === null) {
            return $this->count() === 0;
        }

        return empty($this->rawCart($restaurantId)['items']);
    }

    public function soleRestaurantId(): ?int
    {
        $ids = $this->restaurantIds();

        return count($ids) === 1 ? $ids[0] : null;
    }

    public function restaurantIds(): array
    {
        return array_values(array_map(
            'intval',
            array_keys(array_filter(
                $this->carts(),
                fn (array $cart) => !empty($cart['items']),
            )),
        ));
    }

    public function getFulfillment(?int $restaurantId = null): string
    {
        return $this->rawCart($restaurantId)['fulfillment'];
    }

    public function setFulfillment(string $fulfillment, ?int $restaurantId = null): void
    {
        if ($restaurantId === null) {
            return;
        }

        $carts = $this->carts();
        $key = (string) $restaurantId;
        $cart = $carts[$key] ?? $this->emptyCart($restaurantId);
        $cart['fulfillment'] = $fulfillment;
        $carts[$key] = $cart;
        $this->saveCarts($carts);
    }

    public function isPickup(?int $restaurantId = null): bool
    {
        return $this->getFulfillment($restaurantId) === Order::FULFILLMENT_PICKUP;
    }

    public function getItems(?int $restaurantId = null): Collection
    {
        $cart = $this->rawCart($restaurantId);

        if (empty($cart['items']) || $cart['restaurant_id'] === null) {
            return collect();
        }

        $menuItems = MenuItem::whereIn('id', array_keys($cart['items']))
            ->get()
            ->keyBy('id');

        return collect($cart['items'])
            ->map(function (int $quantity, int $menuItemId) use ($menuItems, $cart) {
                $menuItem = $menuItems->get($menuItemId);

                if (!$menuItem || $menuItem->restaurant_id !== $cart['restaurant_id']) {
                    return null;
                }

                $price = (float) $menuItem->price;

                return [
                    'menu_item_id' => $menuItem->id,
                    'category_id' => $menuItem->menu_category_id,
                    'name' => $menuItem->name,
                    'description' => $menuItem->description,
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

    public function getSubtotal(?int $restaurantId = null): float
    {
        return round((float) $this->getItems($restaurantId)->sum('subtotal'), 2);
    }

    public function hasUnavailableItems(?int $restaurantId = null): bool
    {
        return $this->getItems($restaurantId)->contains(fn (array $item) => !$item['is_available']);
    }

    public function suggestions(int $restaurantId): Collection
    {
        $items = $this->getItems($restaurantId);
        $categoryIds = $items->pluck('category_id')->filter()->unique()->values();

        if ($categoryIds->isEmpty()) {
            return collect();
        }

        return MenuItem::query()
            ->where('restaurant_id', $restaurantId)
            ->where('is_available', true)
            ->whereIn('menu_category_id', $categoryIds)
            ->whereNotIn('id', $items->pluck('menu_item_id'))
            ->limit(8)
            ->get()
            ->map(fn (MenuItem $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'image_url' => $item->image_url,
                'price' => (float) $item->price,
            ])
            ->values();
    }

    private function carts(): array
    {
        $stored = session(self::SESSION_KEY, []);

        if (isset($stored['carts']) && is_array($stored['carts'])) {
            return $stored['carts'];
        }

        $legacyId = $stored['restaurant_id'] ?? null;
        $legacyItems = $stored['items'] ?? [];

        if (!$legacyId || $legacyItems === []) {
            return [];
        }

        $carts = [
            (string) $legacyId => $this->normalizeCart([
                'restaurant_id' => (int) $legacyId,
                'items' => $legacyItems,
                'fulfillment' => $stored['fulfillment'] ?? Order::FULFILLMENT_DELIVERY,
            ]),
        ];
        $this->saveCarts($carts);

        return $carts;
    }

    private function saveCarts(array $carts): void
    {
        session([self::SESSION_KEY => ['carts' => $carts]]);
    }

    private function rawCart(?int $restaurantId): array
    {
        if ($restaurantId === null) {
            $id = $this->soleRestaurantId();

            return $id ? $this->rawCart($id) : $this->emptyCart(null);
        }

        return $this->normalizeCart(
            $this->carts()[(string) $restaurantId] ?? $this->emptyCart($restaurantId),
        );
    }

    private function emptyCart(?int $restaurantId): array
    {
        return [
            'restaurant_id' => $restaurantId,
            'items' => [],
            'fulfillment' => Order::FULFILLMENT_DELIVERY,
        ];
    }

    private function normalizeCart(array $cart): array
    {
        $fulfillment = $cart['fulfillment'] ?? Order::FULFILLMENT_DELIVERY;

        if (!in_array($fulfillment, Order::FULFILLMENTS, true)) {
            $fulfillment = Order::FULFILLMENT_DELIVERY;
        }

        return [
            'restaurant_id' => isset($cart['restaurant_id']) ? (int) $cart['restaurant_id'] : null,
            'items' => $cart['items'] ?? [],
            'fulfillment' => $fulfillment,
        ];
    }

    private function keyForItem(array $carts, int $menuItemId): ?string
    {
        foreach ($carts as $key => $cart) {
            if (array_key_exists($menuItemId, $cart['items'] ?? [])) {
                return (string) $key;
            }
        }

        return null;
    }
}
