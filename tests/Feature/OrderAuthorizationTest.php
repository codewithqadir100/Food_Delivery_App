<?php

declare(strict_types=1);

use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;

function createOrderFor(Restaurant $restaurant, ?User $customer = null, string $status = Order::STATUS_PENDING): Order
{
    $customer ??= User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);

    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);

    return Order::create([
        'customer_id' => $customer->id,
        'restaurant_id' => $restaurant->id,
        'customer_address_id' => $address->id,
        'status' => $status,
        'subtotal' => 500,
        'delivery_fee' => 100,
        'total' => 600,
    ]);
}

test('customer can only see their own orders', function () {
    $restaurant = Restaurant::factory()->create();
    $owner = $restaurant->user;
    $customerA = User::factory()->create(['role' => User::ROLE_CUSTOMER, 'status' => User::STATUS_APPROVED]);
    $customerB = User::factory()->create(['role' => User::ROLE_CUSTOMER, 'status' => User::STATUS_APPROVED]);

    $orderA = createOrderFor($restaurant, $customerA);

    $this->actingAs($customerA)->get(route('customer.orders.show', $orderA))->assertOk();
    $this->actingAs($customerB)->get(route('customer.orders.show', $orderA))->assertForbidden();
});

test('restaurant can only access their own restaurant orders', function () {
    $restaurantA = Restaurant::factory()->create();
    $restaurantB = Restaurant::factory()->create();

    $orderForA = createOrderFor($restaurantA);

    $this->actingAs($restaurantA->user)->get(route('restaurant.orders.show', $orderForA))->assertOk();
    $this->actingAs($restaurantB->user)->get(route('restaurant.orders.show', $orderForA))->assertForbidden();
});

test('restaurant owner cannot update the status of another restaurants order', function () {
    $restaurantA = Restaurant::factory()->create();
    $restaurantB = Restaurant::factory()->create();

    $orderForA = createOrderFor($restaurantA);

    $response = $this->actingAs($restaurantB->user)->patchJson(
        route('restaurant.orders.update-status', $orderForA),
        ['status' => Order::STATUS_CONFIRMED],
    );

    $response->assertForbidden();
});

test('restaurant can set any status before the order is finished', function () {
    $restaurant = Restaurant::factory()->create();
    $order = createOrderFor($restaurant, status: Order::STATUS_PENDING);

    $response = $this->actingAs($restaurant->user)->patchJson(
        route('restaurant.orders.update-status', $order),
        ['status' => Order::STATUS_DELIVERED],
    );

    $response->assertOk();
    expect($order->refresh()->status)->toBe(Order::STATUS_DELIVERED);
});

test('restaurant order feed returns only orders newer than the cursor', function () {
    $restaurant = Restaurant::factory()->create();
    $existing = createOrderFor($restaurant);

    $this->actingAs($restaurant->user)
        ->getJson(route('restaurant.orders.feed', ['after_id' => $existing->id]))
        ->assertOk()
        ->assertJsonCount(0, 'orders');

    $newer = createOrderFor($restaurant);

    $this->actingAs($restaurant->user)
        ->getJson(route('restaurant.orders.feed', ['after_id' => $existing->id]))
        ->assertOk()
        ->assertJsonPath('orders.0.id', $newer->id);
});

test('delivered orders cannot be modified further', function () {
    $restaurant = Restaurant::factory()->create();
    $order = createOrderFor($restaurant, status: Order::STATUS_DELIVERED);

    $response = $this->actingAs($restaurant->user)->patchJson(
        route('restaurant.orders.update-status', $order),
        ['status' => Order::STATUS_PREPARING],
    );

    $response->assertStatus(422);
});

test('cancelled orders cannot be modified further', function () {
    $restaurant = Restaurant::factory()->create();
    $order = createOrderFor($restaurant, status: Order::STATUS_CANCELLED);

    $response = $this->actingAs($restaurant->user)->patchJson(
        route('restaurant.orders.update-status', $order),
        ['status' => Order::STATUS_CONFIRMED],
    );

    $response->assertStatus(422);
});

test('a valid forward transition is accepted', function () {
    $restaurant = Restaurant::factory()->create();
    $order = createOrderFor($restaurant, status: Order::STATUS_PENDING);

    $response = $this->actingAs($restaurant->user)->patchJson(
        route('restaurant.orders.update-status', $order),
        ['status' => Order::STATUS_CONFIRMED],
    );

    $response->assertOk();
    expect($order->refresh()->status)->toBe(Order::STATUS_CONFIRMED);
});

test('customer can cancel before the restaurant starts preparing', function (string $status) {
    $restaurant = Restaurant::factory()->create();
    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
    $order = createOrderFor($restaurant, $customer, $status);

    $this->actingAs($customer)->patchJson(route('customer.orders.cancel', $order), [
        'cancellation_reason' => 'Changed my mind',
    ])->assertOk()
        ->assertJsonPath('data.status', Order::STATUS_CANCELLED)
        ->assertJsonPath('data.cancelled_by', Order::CANCELLED_BY_CUSTOMER);

    $order->refresh();
    expect($order->status)->toBe(Order::STATUS_CANCELLED)
        ->and($order->cancelled_by)->toBe(Order::CANCELLED_BY_CUSTOMER)
        ->and($order->cancellation_reason)->toBe('Changed my mind')
        ->and($order->cancelled_at)->not->toBeNull();
})->with([
    Order::STATUS_PENDING,
    Order::STATUS_CONFIRMED,
]);

test('customer cannot cancel once preparation has started', function (string $status) {
    $restaurant = Restaurant::factory()->create();
    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
    $order = createOrderFor($restaurant, $customer, $status);

    $this->actingAs($customer)->patchJson(route('customer.orders.cancel', $order), [
        'cancellation_reason' => 'Too late',
    ])->assertForbidden();

    expect($order->refresh()->status)->toBe($status);
})->with([
    Order::STATUS_PREPARING,
    Order::STATUS_READY,
    Order::STATUS_OUT_FOR_DELIVERY,
    Order::STATUS_DELIVERED,
    Order::STATUS_CANCELLED,
]);

test('customer must give a reason to cancel', function () {
    $restaurant = Restaurant::factory()->create();
    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
    $order = createOrderFor($restaurant, $customer);

    $this->actingAs($customer)->patchJson(route('customer.orders.cancel', $order), [
        'cancellation_reason' => '',
    ])->assertStatus(422);

    expect($order->refresh()->status)->toBe(Order::STATUS_PENDING);
});

test('customer cannot cancel someone elses order', function () {
    $restaurant = Restaurant::factory()->create();
    $owner = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
    $other = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
    $order = createOrderFor($restaurant, $owner);

    $this->actingAs($other)->patchJson(route('customer.orders.cancel', $order), [
        'cancellation_reason' => 'Not mine',
    ])->assertForbidden();

    expect($order->refresh()->status)->toBe(Order::STATUS_PENDING);
});

test('restaurant cancel records who cancelled', function () {
    $restaurant = Restaurant::factory()->create();
    $order = createOrderFor($restaurant);

    $this->actingAs($restaurant->user)->patchJson(
        route('restaurant.orders.update-status', $order),
        [
            'status' => Order::STATUS_CANCELLED,
            'cancellation_reason' => 'Out of stock',
        ],
    )->assertOk();

    $order->refresh();
    expect($order->cancelled_by)->toBe(Order::CANCELLED_BY_RESTAURANT)
        ->and($order->cancellation_reason)->toBe('Out of stock');
});

test('restaurant order feed includes status changes since the cursor', function () {
    $restaurant = Restaurant::factory()->create();
    $order = createOrderFor($restaurant);

    $this->actingAs($restaurant->user)->patchJson(
        route('restaurant.orders.update-status', $order),
        [
            'status' => Order::STATUS_CANCELLED,
            'cancellation_reason' => 'Closed',
        ],
    )->assertOk();

    $this->actingAs($restaurant->user)
        ->getJson(route('restaurant.orders.feed', [
            'after_id' => $order->id,
            'since' => now()->subMinute()->toIso8601String(),
        ]))
        ->assertOk()
        ->assertJsonCount(0, 'orders')
        ->assertJsonPath('updates.0.id', $order->id)
        ->assertJsonPath('updates.0.status', Order::STATUS_CANCELLED)
        ->assertJsonPath('updates.0.cancelled_by', Order::CANCELLED_BY_RESTAURANT);
});

test('customer order feed returns only that customers updated orders', function () {
    $restaurant = Restaurant::factory()->create();
    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
    $other = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
    $order = createOrderFor($restaurant, $customer, Order::STATUS_CONFIRMED);
    createOrderFor($restaurant, $other, Order::STATUS_CONFIRMED);

    $this->actingAs($restaurant->user)->patchJson(
        route('restaurant.orders.update-status', $order),
        ['status' => Order::STATUS_PREPARING],
    )->assertOk();

    $this->actingAs($customer)
        ->getJson(route('customer.orders.feed', [
            'since' => now()->subMinute()->toIso8601String(),
        ]))
        ->assertOk()
        ->assertJsonCount(1, 'orders')
        ->assertJsonPath('orders.0.id', $order->id)
        ->assertJsonPath('orders.0.status', Order::STATUS_PREPARING);
});
