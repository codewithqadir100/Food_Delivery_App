<?php

declare(strict_types=1);

use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\User;
use Database\Seeders\PlanSeeder;

beforeEach(function () {
    $this->seed(PlanSeeder::class);
});

test('customer listing hides restaurants without an activated subscription and lists orderable ones first', function () {
    $hidden = Restaurant::factory()->create(['name' => 'Hidden Kitchen']);
    $normal = Restaurant::factory()->subscribed(Plan::CODE_NORMAL)->create(['name' => 'Normal Kitchen']);
    $featured = Restaurant::factory()->subscribed(Plan::CODE_FEATURED)->create(['name' => 'Featured Kitchen']);
    $expired = Restaurant::factory()->subscribed(Plan::CODE_NORMAL, true)->create(['name' => 'Expired Kitchen']);
    $closed = Restaurant::factory()->subscribed()->closed()->create(['name' => 'Closed Kitchen']);

    $response = $this->getJson('/api/restaurants');

    $response->assertOk();

    $names = collect($response->json('data'))->pluck('name')->values();

    expect($names)->not->toContain($hidden->name);
    expect($names->search($featured->name))->toBeLessThan($names->search($normal->name));
    expect($names->search($normal->name))->toBeLessThan($names->search($expired->name));
    expect($names->search($normal->name))->toBeLessThan($names->search($closed->name));

    $byName = collect($response->json('data'))->keyBy('name');

    expect($byName[$featured->name]['listing_availability'])->toBe(Restaurant::LISTING_AVAILABLE);
    expect($byName[$featured->name]['is_featured'])->toBeTrue();
    expect($byName[$normal->name]['listing_availability'])->toBe(Restaurant::LISTING_AVAILABLE);
    expect($byName[$expired->name]['listing_availability'])->toBe(Restaurant::LISTING_UNAVAILABLE);
    expect($byName[$closed->name]['listing_availability'])->toBe(Restaurant::LISTING_UNAVAILABLE);
});

test('unavailable restaurants cannot be opened for ordering', function () {
    $expired = Restaurant::factory()->subscribed(Plan::CODE_NORMAL, true)->create();

    $this->get(route('customer.restaurant.menu', $expired))->assertNotFound();
});

test('an unapproved restaurant is omitted even if it has a subscription record', function () {
    $pending = Restaurant::factory()->pending()->subscribed()->create(['name' => 'Pending Kitchen']);

    $names = collect($this->getJson('/api/restaurants')->json('data'))->pluck('name');

    expect($names)->not->toContain($pending->name);
});

test('featured filter returns only featured restaurants', function () {
    Restaurant::factory()->subscribed(Plan::CODE_NORMAL)->create(['name' => 'Normal Kitchen']);
    Restaurant::factory()->subscribed(Plan::CODE_FEATURED)->create(['name' => 'Featured Kitchen']);

    $names = collect($this->getJson('/api/restaurants?featured=1')->json('data'))->pluck('name');

    expect($names)->toContain('Featured Kitchen')
        ->not->toContain('Normal Kitchen');
});

test('home chef filter returns only home chefs', function () {
    Restaurant::factory()->subscribed()->create(['name' => 'Street Kitchen', 'is_home_chef' => false]);
    Restaurant::factory()->subscribed()->create(['name' => 'Home Kitchen', 'is_home_chef' => true]);

    $names = collect($this->getJson('/api/restaurants?home_chef=1')->json('data'))->pluck('name');

    expect($names)->toContain('Home Kitchen')
        ->not->toContain('Street Kitchen');
});

test('a 4 plus rating filter excludes lower and unrated restaurants', function () {
    $high = Restaurant::factory()->subscribed()->create(['name' => 'High Kitchen']);
    $low = Restaurant::factory()->subscribed()->create(['name' => 'Low Kitchen']);
    Restaurant::factory()->subscribed()->create(['name' => 'Quiet Kitchen']);

    listingReview($high, 5);
    listingReview($low, 3);

    $names = collect($this->getJson('/api/restaurants?min_rating=4')->json('data'))->pluck('name');

    expect($names)->toContain('High Kitchen')
        ->not->toContain('Low Kitchen')
        ->not->toContain('Quiet Kitchen');
});

test('the default listing keeps featured restaurants above a higher rating', function () {
    $featured = Restaurant::factory()->subscribed(Plan::CODE_FEATURED)->create(['name' => 'Featured Kitchen']);
    $better = Restaurant::factory()->subscribed(Plan::CODE_NORMAL)->create(['name' => 'Better Kitchen']);

    listingReview($featured, 3);
    listingReview($better, 5);

    $names = collect($this->getJson('/api/restaurants')->json('data'))->pluck('name')->values();

    expect($names->search('Featured Kitchen'))->toBeLessThan($names->search('Better Kitchen'));
});

test('top rated sort puts the higher average first', function () {
    $lower = Restaurant::factory()->subscribed()->create(['name' => 'Lower Kitchen']);
    $higher = Restaurant::factory()->subscribed()->create(['name' => 'Higher Kitchen']);

    listingReview($lower, 3);
    listingReview($higher, 5);

    $names = collect($this->getJson('/api/restaurants?sort=top_rated')->json('data'))->pluck('name')->values();

    expect($names->search('Higher Kitchen'))->toBeLessThan($names->search('Lower Kitchen'));
});

function listingReview(Restaurant $restaurant, int $rating): void
{
    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);
    $address = CustomerAddress::factory()->create(['customer_id' => $customer->id]);
    $order = Order::query()->create([
        'customer_id' => $customer->id,
        'restaurant_id' => $restaurant->id,
        'customer_address_id' => $address->id,
        'status' => Order::STATUS_DELIVERED,
        'subtotal' => 500,
        'delivery_fee' => 100,
        'total' => 600,
    ]);

    Review::query()->create([
        'order_id' => $order->id,
        'customer_id' => $customer->id,
        'restaurant_id' => $restaurant->id,
        'rating' => $rating,
        'comment' => 'Worth ordering again.',
    ]);
}
