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

test('invalid status transitions are rejected', function () {
    $restaurant = Restaurant::factory()->create();
    $order = createOrderFor($restaurant, status: Order::STATUS_PENDING);

    $response = $this->actingAs($restaurant->user)->patchJson(
        route('restaurant.orders.update-status', $order),
        ['status' => Order::STATUS_DELIVERED],
    );

    $response->assertStatus(422);
    expect($order->refresh()->status)->toBe(Order::STATUS_PENDING);
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
