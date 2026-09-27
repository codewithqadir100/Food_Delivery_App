<?php

declare(strict_types=1);

use App\Models\CustomerAddress;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Notifications\NewOrderReceived;
use Illuminate\Support\Facades\Notification;

function checkoutCustomer(): User
{
    return User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
}

function addItemToCart(User $customer, MenuItem $menuItem, int $quantity = 1): void
{
    test()->actingAs($customer)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => $quantity,
    ])->assertOk();
}

test('customer can checkout a valid cart', function () {
    Notification::fake();

    $restaurant = Restaurant::factory()->subscribed()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'price' => 500]);
    $customer = checkoutCustomer();
    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);

    addItemToCart($customer, $menuItem, 2);

    $response = $this->actingAs($customer)->post(route('customer.checkout.store'), [
        'customer_address_id' => $address->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('orders', [
        'customer_id' => $customer->id,
        'restaurant_id' => $restaurant->id,
        'subtotal' => 1000,
    ]);

    Notification::assertSentTo($restaurant->user, NewOrderReceived::class);
});

test('customer cannot checkout an empty cart', function () {
    $customer = checkoutCustomer();
    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);

    $response = $this->actingAs($customer)->post(route('customer.checkout.store'), [
        'customer_address_id' => $address->id,
    ]);

    $response->assertRedirect(route('customer.cart.index'));
    $this->assertDatabaseCount('orders', 0);
});

test('customer cannot use another customers address to checkout', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id]);
    $customer = checkoutCustomer();
    $otherCustomersAddress = CustomerAddress::factory()->create();

    addItemToCart($customer, $menuItem);

    $response = $this->actingAs($customer)->post(route('customer.checkout.store'), [
        'customer_address_id' => $otherCustomersAddress->id,
    ]);

    $response->assertSessionHasErrors('customer_address_id');
    $this->assertDatabaseCount('orders', 0);
});

test('checkout rejects an address outside the restaurant delivery radius', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id]);
    $customer = checkoutCustomer();
    $address = CustomerAddress::factory()->farAway()->create(['customer_id' => $customer->id]);

    addItemToCart($customer, $menuItem);

    $response = $this->actingAs($customer)->post(route('customer.checkout.store'), [
        'customer_address_id' => $address->id,
    ]);

    $response->assertSessionHas('error');
    $this->assertDatabaseCount('orders', 0);
});

test('checkout rejects missing restaurant coordinates instead of defaulting to a free delivery', function () {
    $restaurant = Restaurant::factory()->subscribed()->withoutCoordinates()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id]);
    $customer = checkoutCustomer();
    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);

    addItemToCart($customer, $menuItem);

    $response = $this->actingAs($customer)->post(route('customer.checkout.store'), [
        'customer_address_id' => $address->id,
    ]);

    $response->assertSessionHas('error');
    $this->assertDatabaseCount('orders', 0);
});

test('checkout rejects a closed restaurant', function () {
    $restaurant = Restaurant::factory()->subscribed()->closed()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id]);
    $customer = checkoutCustomer();

    $this->actingAs($customer)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => 1,
    ])->assertStatus(422);

    $this->assertDatabaseCount('orders', 0);
});

test('checkout rejects an unapproved restaurant', function () {
    $restaurant = Restaurant::factory()->pending()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id]);
    $customer = checkoutCustomer();

    $this->actingAs($customer)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => 1,
    ])->assertStatus(422);

    $this->assertDatabaseCount('orders', 0);
});

test('checkout rejects an item that became unavailable after being added to the cart', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id]);
    $customer = checkoutCustomer();
    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);

    addItemToCart($customer, $menuItem);

    $menuItem->update(['is_available' => false]);

    $response = $this->actingAs($customer)->post(route('customer.checkout.store'), [
        'customer_address_id' => $address->id,
    ]);

    $response->assertSessionHas('error');
    $this->assertDatabaseCount('orders', 0);
});

test('order uses the current menu item price rather than a stale cart price', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'price' => 200]);
    $customer = checkoutCustomer();
    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);

    addItemToCart($customer, $menuItem, 1);

    $menuItem->update(['price' => 350]);

    $this->actingAs($customer)->post(route('customer.checkout.store'), [
        'customer_address_id' => $address->id,
    ])->assertRedirect();

    $order = Order::first();
    expect((float) $order->items->first()->price)->toBe(350.0);
    expect((float) $order->subtotal)->toBe(350.0);
});

test('order total equals subtotal plus delivery fee', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id, 'price' => 500]);
    $customer = checkoutCustomer();
    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);

    addItemToCart($customer, $menuItem, 1);

    $this->actingAs($customer)->post(route('customer.checkout.store'), [
        'customer_address_id' => $address->id,
    ])->assertRedirect();

    $order = Order::first();
    expect((float) $order->total)->toBe(round((float) $order->subtotal + (float) $order->delivery_fee, 2));
    expect((float) $order->delivery_fee)->toBeGreaterThan(0);
});
