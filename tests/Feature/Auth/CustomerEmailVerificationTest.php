<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

test('email verification screen can be rendered for a customer', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Auth/VerifyEmail')
            ->where('status', 'verification-link-sent')
            ->where('description', $user->emailVerificationMessage()));

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('a customer email can be verified and continues to the address page', function () {
    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)],
        false,
    );

    $this->actingAs($user)
        ->get($verificationUrl)
        ->assertRedirect(route('customer.addresses.create'));

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('an unverified customer can browse but cannot open account pages', function () {
    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);

    $this->actingAs($user)
        ->get(route('customer.cart.index'))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('customer.addresses.create'))
        ->assertRedirect(route('verification.notice'));

    $this->actingAs($user)
        ->get(route('customer.orders.index'))
        ->assertRedirect(route('verification.notice'));
});

test('a logged out customer opening the verification link is sent to customer login', function () {
    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)],
        false,
    );

    $this->get($verificationUrl)->assertRedirect(route('login'));
});

test('a logged out restaurant owner opening the verification link is sent to restaurant login', function () {
    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
    ]);

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)],
        false,
    );

    $this->get($verificationUrl)->assertRedirect(route('restaurant.login'));
});
