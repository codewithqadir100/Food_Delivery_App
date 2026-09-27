<?php

declare(strict_types=1);

use App\Models\Plan;
use App\Models\Restaurant;
use Database\Seeders\PlanSeeder;

beforeEach(function () {
    $this->seed(PlanSeeder::class);
});

test('customer listing hides restaurants without an activated subscription and ranks featured restaurants first', function () {
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
