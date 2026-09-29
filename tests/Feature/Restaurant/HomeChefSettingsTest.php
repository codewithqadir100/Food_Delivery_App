<?php

declare(strict_types=1);

use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('restaurant registration stores the home chef choice', function () {
    Notification::fake();

    $category = RestaurantCategory::factory()->create();

    $this->post(route('restaurant.register'), [
        'email' => 'chef@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'restaurant_name' => 'Home Kitchen',
        'restaurant_category_id' => $category->id,
        'is_home_chef' => true,
    ])->assertRedirect(route('verification.notice'));

    $restaurant = Restaurant::query()->where('name', 'Home Kitchen')->first();

    expect($restaurant)->not->toBeNull();
    expect($restaurant->is_home_chef)->toBeTrue();
    Notification::assertSentTo($restaurant->user, VerifyEmail::class);
});

test('google completion stores the home chef choice', function () {
    $category = RestaurantCategory::factory()->create();
    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($owner)
        ->post(route('restaurant.register.complete.store'), [
            'restaurant_name' => 'Chef Kitchen',
            'restaurant_category_id' => $category->id,
            'is_home_chef' => true,
        ])
        ->assertRedirect(route('restaurant.dashboard'));

    expect($owner->fresh()->restaurant->is_home_chef)->toBeTrue();
});

test('a restaurant owner can change the home chef choice from settings', function () {
    $restaurant = Restaurant::factory()->create([
        'is_home_chef' => false,
        'status' => Restaurant::STATUS_PENDING,
    ]);
    $restaurant->user->update([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($restaurant->user)
        ->get(route('restaurant.settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Restaurant/Settings')
            ->where('isHomeChef', false));

    $this->actingAs($restaurant->user)
        ->patch(route('restaurant.settings.update'), [
            'is_home_chef' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($restaurant->fresh()->is_home_chef)->toBeTrue();
});
