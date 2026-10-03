<?php

declare(strict_types=1);

use App\Models\CustomerAddress;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function addressCustomer(): User
{
    return User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
}

function addressPayload(string $street = 'House 12, Street 4'): array
{
    return [
        'latitude' => 24.8615,
        'longitude' => 67.0020,
        'city_name' => 'Karachi',
        'area_name' => 'Clifton',
        'street_address' => $street,
    ];
}

test('the first saved address becomes primary', function () {
    $customer = addressCustomer();

    $this->actingAs($customer)
        ->post(route('customer.addresses.store'), addressPayload())
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('customer.addresses.index'))
        ->assertSessionHas('success', 'Address saved.');

    $address = $customer->addresses()->first();

    expect($address)->not->toBeNull()
        ->and($address->is_primary)->toBeTrue()
        ->and($address->street_address)->toBe('House 12, Street 4');
});

test('another address is added without replacing the primary one', function () {
    $customer = addressCustomer();
    $primary = CustomerAddress::factory()->create([
        'customer_id' => $customer->id,
        'street_address' => 'First House 1',
        'is_primary' => true,
        'created_at' => now()->subDay(),
    ]);

    $this->actingAs($customer)
        ->post(route('customer.addresses.store'), addressPayload('Second House 2'))
        ->assertRedirect(route('customer.addresses.index'));

    expect($customer->addresses()->count())->toBe(2)
        ->and($primary->fresh()->is_primary)->toBeTrue()
        ->and($primary->fresh()->street_address)->toBe('First House 1');

    $this->actingAs($customer)
        ->get(route('customer.addresses.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/AddressIndex')
            ->has('addresses', 2)
            ->where('addresses.0.id', $primary->id)
            ->where('addresses.0.is_primary', true)
            ->where('addresses.1.street_address', 'Second House 2')
            ->where('addresses.1.is_primary', false));
});

test('a customer can edit their own address', function () {
    $customer = addressCustomer();
    $address = CustomerAddress::factory()->create([
        'customer_id' => $customer->id,
        'is_primary' => true,
    ]);

    $this->actingAs($customer)
        ->patch(route('customer.addresses.update', $address), addressPayload('Updated House 9'))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('customer.addresses.index'))
        ->assertSessionHas('success', 'Address updated.');

    expect($address->fresh()->street_address)->toBe('Updated House 9')
        ->and($address->fresh()->is_primary)->toBeTrue();
});

test('a customer cannot change someone else address', function () {
    $customer = addressCustomer();
    $other = CustomerAddress::factory()->create();

    $this->actingAs($customer)
        ->patch(route('customer.addresses.update', $other), addressPayload())
        ->assertNotFound();

    $this->actingAs($customer)
        ->delete(route('customer.addresses.destroy', $other))
        ->assertNotFound();

    expect($other->fresh())->not->toBeNull();
});

test('deleting the primary address promotes the oldest remaining address', function () {
    $customer = addressCustomer();
    $primary = CustomerAddress::factory()->create([
        'customer_id' => $customer->id,
        'is_primary' => true,
        'created_at' => now()->subDays(2),
    ]);
    $oldest = CustomerAddress::factory()->create([
        'customer_id' => $customer->id,
        'street_address' => 'Oldest extra',
        'is_primary' => false,
        'created_at' => now()->subDay(),
    ]);
    CustomerAddress::factory()->create([
        'customer_id' => $customer->id,
        'is_primary' => false,
        'created_at' => now(),
    ]);

    $this->actingAs($customer)
        ->delete(route('customer.addresses.destroy', $primary))
        ->assertRedirect(route('customer.addresses.index'))
        ->assertSessionHas('success', 'Address removed.');

    expect($primary->fresh())->toBeNull()
        ->and($oldest->fresh()->is_primary)->toBeTrue()
        ->and($customer->addresses()->where('is_primary', true)->count())->toBe(1);
});

test('saving from checkout returns to checkout', function () {
    $customer = addressCustomer();
    $restaurant = Restaurant::factory()->subscribed()->create();

    $this->actingAs($customer)
        ->post(route('customer.addresses.store'), [
            ...addressPayload(),
            'return_to' => 'checkout',
            'restaurant_id' => $restaurant->id,
        ])
        ->assertRedirect(route('customer.checkout.show', $restaurant));
});

test('checkout lists every address and preselects the primary one', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();
    $menuItem = MenuItem::factory()->create(['restaurant_id' => $restaurant->id]);
    $customer = addressCustomer();
    $primary = CustomerAddress::factory()->create([
        'customer_id' => $customer->id,
        'street_address' => 'Primary House',
        'is_primary' => true,
        'created_at' => now()->subDay(),
    ]);
    CustomerAddress::factory()->create([
        'customer_id' => $customer->id,
        'street_address' => 'Other House',
        'is_primary' => false,
    ]);

    $this->actingAs($customer)->postJson(route('customer.cart.store'), [
        'menu_item_id' => $menuItem->id,
        'quantity' => 1,
    ])->assertOk();

    $this->actingAs($customer)
        ->get(route('customer.checkout.show', $restaurant))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Checkout')
            ->has('addresses', 2)
            ->where('addresses.0.id', $primary->id)
            ->where('addresses.0.is_primary', true)
            ->where('addresses.1.is_primary', false));
});

test('guests and other roles cannot open customer addresses', function () {
    $this->get(route('customer.addresses.index'))
        ->assertRedirect(route('login'));

    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_APPROVED,
    ]);

    $this->actingAs($owner)
        ->get(route('customer.addresses.index'))
        ->assertForbidden();
});
