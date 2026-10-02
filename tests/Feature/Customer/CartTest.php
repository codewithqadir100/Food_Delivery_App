<?php

declare(strict_types=1);

use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function customer(): User
{
    return User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
}

test('customer can add an available item to the cart', function () {
    $menuItem = MenuItem::factory()->create();

    $response = $this->actingAs(customer())
        ->postJson(route('customer.cart.store'), [
            'menu_item_id' => $menuItem->id,
            'quantity' => 2,
        ]);

    $response->assertOk()->assertJsonPath('success', true);
    expect($response->json('cart_count'))->toBe(2);
});

test('customer cannot add an unavailable item to the cart', function () {
    $menuItem = MenuItem::factory()->unavailable()->create();

    $response = $this->actingAs(customer())
        ->postJson(route('customer.cart.store'), [
            'menu_item_id' => $menuItem->id,
            'quantity' => 1,
        ]);

    $response->assertStatus(422);
});

test('customer cannot update a menu item that is not already in their cart', function () {
    $menuItem = MenuItem::factory()->create();

    $response = $this->actingAs(customer())
        ->patchJson(route('customer.cart.update', $menuItem->id), [
            'quantity' => 5,
        ]);

    $response->assertStatus(404);
});

test('update endpoint cannot be used to inject an arbitrary menu item into the cart', function () {
    $inCart = MenuItem::factory()->create();
    $notInCart = MenuItem::factory()->create(['restaurant_id' => $inCart->restaurant_id]);
    $user = customer();

    $this->actingAs($user)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $inCart->id,
        'quantity' => 1,
    ])->assertOk();

    $response = $this->actingAs($user)->patchJson(route('customer.cart.update', $notInCart->id), [
        'quantity' => 3,
    ]);

    $response->assertStatus(404);

    $cartData = $this->actingAs($user)->getJson(route('customer.cart.data'))->json('data');
    expect(collect($cartData['items'])->pluck('menu_item_id'))
        ->toContain($inCart->id)
        ->not->toContain($notInCart->id);
});

test('adding an item from a different restaurant keeps both carts', function () {
    $itemA = MenuItem::factory()->create();
    $itemB = MenuItem::factory()->create();
    $user = customer();

    $this->actingAs($user)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $itemA->id,
        'quantity' => 1,
    ])->assertOk();

    $response = $this->actingAs($user)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $itemB->id,
        'quantity' => 1,
    ]);

    $response->assertOk()->assertJsonPath('switched_restaurant', false);

    $carts = $this->actingAs($user)->getJson(route('customer.cart.data'))->json('data.carts');
    $itemIds = collect($carts)->flatMap(fn ($cart) => collect($cart['items'])->pluck('menu_item_id'));

    expect($itemIds)->toContain($itemA->id)->toContain($itemB->id);
    expect($carts)->toHaveCount(2);
});

test('cart quantity cannot be negative or excessive', function () {
    $menuItem = MenuItem::factory()->create();
    $user = customer();

    $this->actingAs($user)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => 1,
    ])->assertOk();

    $this->actingAs($user)->patchJson(route('customer.cart.update', $menuItem->id), [
        'quantity' => -1,
    ])->assertStatus(422);

    $this->actingAs($user)->patchJson(route('customer.cart.update', $menuItem->id), [
        'quantity' => 999,
    ])->assertStatus(422);
});

test('setting quantity to zero removes the item from the cart', function () {
    $menuItem = MenuItem::factory()->create();
    $user = customer();

    $this->actingAs($user)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => 1,
    ])->assertOk();

    $response = $this->actingAs($user)->patchJson(route('customer.cart.update', $menuItem->id), [
        'quantity' => 0,
    ]);

    $response->assertOk();
    expect($response->json('cart_count'))->toBe(0);
});

test('restaurant owners cannot access the customer cart', function () {
    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_APPROVED,
    ]);

    $this->actingAs($owner)
        ->getJson(route('customer.cart.data'))
        ->assertForbidden();
});

test('a guest can add an item and still has it after login', function () {
    $menuItem = MenuItem::factory()->create();
    $user = customer();

    $this->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => 2,
    ])->assertOk();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/');

    $item = collect($this->getJson(route('customer.cart.data'))->json('data.items'))
        ->firstWhere('menu_item_id', $menuItem->id);

    expect($item)->not->toBeNull();
    expect($item['quantity'])->toBe(2);
});

test('a guest cart survives registration', function () {
    $menuItem = MenuItem::factory()->create();

    $this->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => 1,
    ])->assertOk();

    $this->post(route('register'), [
        'name' => 'Ayesha Khan',
        'email' => 'ayesha@example.com',
        'phone' => '03001234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('customer.addresses.create'));

    $items = $this->getJson(route('customer.cart.data'))->json('data.items');

    expect(collect($items)->pluck('menu_item_id'))->toContain($menuItem->id);
});

test('guest checkout shows a login step and returns to the same cart', function () {
    $menuItem = MenuItem::factory()->create();
    $user = customer();

    $this->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => 1,
    ])->assertOk();

    $this->get(route('customer.checkout.show', $menuItem->restaurant_id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Checkout')
            ->where('requires_login', true)
            ->has('items', 1));

    $this->get(route('customer.checkout.login', $menuItem->restaurant_id))
        ->assertRedirect(route('login'));

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('customer.checkout.show', $menuItem->restaurant_id));

    expect(collect($this->getJson(route('customer.cart.data'))->json('data.items'))->pluck('menu_item_id'))
        ->toContain($menuItem->id);
});

test('guests cannot place an order', function () {
    $this->post(route('customer.checkout.store'))
        ->assertRedirect(route('login'));
});
