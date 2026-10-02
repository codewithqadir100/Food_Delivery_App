<?php

declare(strict_types=1);

use App\Models\User;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

function fakeGoogleAccount(string $id, string $email, string $name = 'Ayesha Khan'): void
{
    $googleUser = (new SocialiteUser)->map([
        'id' => $id,
        'name' => $name,
        'email' => $email,
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($googleUser);
    Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);
}

test('customer google redirect stores the customer intent', function () {
    $provider = Mockery::mock();
    $provider->shouldReceive('redirect')->once()->andReturn(redirect('https://accounts.google.com'));
    Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

    $this->get(route('auth.google.redirect', ['intent' => 'customer']))
        ->assertRedirect('https://accounts.google.com')
        ->assertSessionHas('google_auth_intent', 'customer');
});

test('google sign-in creates a verified customer and sends them to add an address', function () {
    fakeGoogleAccount('google-new-customer', 'new-customer@example.com');

    $this->withSession(['google_auth_intent' => 'customer'])
        ->get(route('auth.google.callback'))
        ->assertRedirect(route('customer.addresses.create'));

    $user = User::query()->where('email', 'new-customer@example.com')->first();

    expect($user)->not->toBeNull()
        ->role->toBe(User::ROLE_CUSTOMER)
        ->status->toBe(User::STATUS_APPROVED)
        ->google_id->toBe('google-new-customer')
        ->phone->toBeNull();

    expect($user->hasVerifiedEmail())->toBeTrue();
    $this->assertAuthenticatedAs($user);
});

test('google sign-in links an existing customer and sends them home', function () {
    $customer = User::factory()->unverified()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
        'email' => 'returning@example.com',
    ]);

    fakeGoogleAccount('google-returning', 'returning@example.com');

    $this->withSession(['google_auth_intent' => 'customer'])
        ->get(route('auth.google.callback'))
        ->assertRedirect('/');

    expect($customer->fresh()->google_id)->toBe('google-returning');
    expect($customer->fresh()->hasVerifiedEmail())->toBeTrue();
    expect($customer->fresh()->role)->toBe(User::ROLE_CUSTOMER);
    $this->assertAuthenticatedAs($customer);
});

test('customer google sign-in does not take over a restaurant owner email', function () {
    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_APPROVED,
        'email' => 'owner@example.com',
    ]);

    fakeGoogleAccount('google-owner-email', 'owner@example.com');

    $this->withSession(['google_auth_intent' => 'customer'])
        ->get(route('auth.google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    expect($owner->fresh()->google_id)->toBeNull();
    expect($owner->fresh()->role)->toBe(User::ROLE_RESTAURANT_OWNER);
    $this->assertGuest();
});

test('customer google sign-in does not restore a banned customer', function () {
    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_BANNED,
        'email' => 'banned-customer@example.com',
    ]);

    fakeGoogleAccount('google-banned-customer', 'banned-customer@example.com');

    $this->withSession(['google_auth_intent' => 'customer'])
        ->get(route('auth.google.callback'))
        ->assertRedirect(route('account.banned'));

    expect($customer->fresh()->google_id)->toBeNull();
    expect($customer->fresh()->status)->toBe(User::STATUS_BANNED);
    $this->assertGuest();
});
