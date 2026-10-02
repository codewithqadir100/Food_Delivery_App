<?php

declare(strict_types=1);

use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(PlanSeeder::class);
});

function wishlistCustomer(): User
{
    return User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
}

test('a customer can save a restaurant and see it on the favourites page', function () {
    $customer = wishlistCustomer();
    $restaurant = Restaurant::factory()->subscribed()->create(['name' => 'Saved Kitchen']);

    $this->actingAs($customer)
        ->postJson(route('customer.wishlist.store', $restaurant))
        ->assertOk()
        ->assertJsonPath('wishlisted', true)
        ->assertJsonPath('message', 'Added to favourites');

    $this->actingAs($customer)
        ->postJson(route('customer.wishlist.store', $restaurant))
        ->assertOk();

    expect($customer->wishlistedRestaurants()->count())->toBe(1);

    $this->actingAs($customer)
        ->get(route('customer.wishlist'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Wishlist')
            ->has('restaurants', 1)
            ->where('restaurants.0.name', 'Saved Kitchen')
            ->where('restaurants.0.is_wishlisted', true)
            ->where('auth.wishlist.has_items', true));
});

test('removing a restaurant clears it from favourites', function () {
    $customer = wishlistCustomer();
    $restaurant = Restaurant::factory()->subscribed()->create();
    $customer->wishlistedRestaurants()->attach($restaurant->id);

    $this->actingAs($customer)
        ->deleteJson(route('customer.wishlist.destroy', $restaurant))
        ->assertOk()
        ->assertJsonPath('wishlisted', false)
        ->assertJsonPath('has_items', false)
        ->assertJsonPath('message', 'Removed from favourites');

    expect($customer->wishlistedRestaurants()->count())->toBe(0);
});

test('a customer only sees their own favourites', function () {
    $customer = wishlistCustomer();
    $other = wishlistCustomer();
    $restaurant = Restaurant::factory()->subscribed()->create(['name' => 'Private Kitchen']);
    $other->wishlistedRestaurants()->attach($restaurant->id);

    $this->actingAs($customer)
        ->get(route('customer.wishlist'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('restaurants', 0)
            ->where('auth.wishlist.has_items', false));
});

test('a hidden restaurant cannot be saved', function () {
    $customer = wishlistCustomer();
    $hidden = Restaurant::factory()->create();

    $this->actingAs($customer)
        ->postJson(route('customer.wishlist.store', $hidden))
        ->assertNotFound();
});

test('guests cannot open or change favourites', function () {
    $restaurant = Restaurant::factory()->subscribed()->create();

    $this->get(route('customer.wishlist'))->assertRedirect(route('login'));
    $this->postJson(route('customer.wishlist.store', $restaurant))->assertUnauthorized();
});

test('restaurant listing marks saved restaurants for the customer', function () {
    $customer = wishlistCustomer();
    $saved = Restaurant::factory()->subscribed(Plan::CODE_NORMAL)->create(['name' => 'Saved Kitchen']);
    $other = Restaurant::factory()->subscribed(Plan::CODE_NORMAL)->create(['name' => 'Other Kitchen']);
    $customer->wishlistedRestaurants()->attach($saved->id);

    $byName = collect($this->actingAs($customer)->getJson('/api/restaurants')->json('data'))->keyBy('name');

    expect($byName['Saved Kitchen']['is_wishlisted'])->toBeTrue();
    expect($byName['Other Kitchen']['is_wishlisted'])->toBeFalse();
    expect($other->id)->not->toBe($saved->id);
});
