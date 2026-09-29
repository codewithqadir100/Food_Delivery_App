<?php

declare(strict_types=1);

use App\Models\Restaurant;
use App\Models\User;
use App\Services\BannedAccountService;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;

test('deleting a restaurant bans the owner and signs them out on the next visit', function () {
    $restaurant = Restaurant::factory()->create();
    $owner = $restaurant->user;
    $owner->update([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_APPROVED,
        'email_verified_at' => now(),
    ]);

    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => true,
    ]);

    $this->actingAs($admin)
        ->delete(route('super-admin.restaurants.destroy', $restaurant))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('restaurants', ['id' => $restaurant->id]);
    expect($owner->fresh()->status)->toBe(User::STATUS_BANNED);

    $this->actingAs($owner->fresh())
        ->get(route('restaurant.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Auth/AccountBanned')
            ->where('signedIn', true));

    $this->actingAs($owner->fresh())
        ->withSession([BannedAccountService::NOTICE_SHOWN => true])
        ->get(route('home'))
        ->assertRedirect(route('restaurant.login'));

    $this->assertGuest();
});

test('a banned restaurant owner cannot sign in again', function () {
    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_BANNED,
        'email' => 'banned-owner@example.com',
    ]);

    $this->post(route('restaurant.login'), [
        'email' => $owner->email,
        'password' => 'password',
    ])->assertRedirect(route('account.banned'));

    $this->assertGuest();

    $this->get(route('account.banned'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Auth/AccountBanned')
            ->where('signedIn', false));
});

test('google sign-in does not restore a banned restaurant owner', function () {
    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_BANNED,
        'email' => 'banned-google@example.com',
    ]);

    $googleOwner = (new Laravel\Socialite\Two\User)->map([
        'id' => 'google-banned',
        'name' => 'Banned Owner',
        'email' => 'banned-google@example.com',
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($googleOwner);
    Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('account.banned'));

    expect($owner->fresh()->status)->toBe(User::STATUS_BANNED);
    expect($owner->fresh()->google_id)->toBeNull();
    $this->assertGuest();
});

test('a rejected restaurant owner is not shown the banned page', function () {
    $restaurant = Restaurant::factory()->create([
        'status' => Restaurant::STATUS_REJECTED,
    ]);
    $restaurant->user->update([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_REJECTED,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($restaurant->user)
        ->get(route('restaurant.dashboard'))
        ->assertForbidden();
});
