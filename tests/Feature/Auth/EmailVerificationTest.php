<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;

test('email verification screen can be rendered for a restaurant owner', function () {
    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
    ]);

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertOk();
});

test('a restaurant owner email can be verified', function () {
    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
    ]);

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('restaurant.dashboard'));
});

test('email is not verified with invalid hash', function () {
    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
    ]);

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')]
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});
