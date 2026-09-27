<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
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
        ['id' => $user->id, 'hash' => sha1($user->email)],
        false,
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
        ['id' => $user->id, 'hash' => sha1('wrong-email')],
        false,
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('opening the verification page sends the link', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
    ]);

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('status', 'verification-link-sent'));

    Notification::assertSentToTimes($user, VerifyEmail::class, 1);

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('status', null));

    Notification::assertSentToTimes($user, VerifyEmail::class, 1);
});

test('resend is rate limited to one email per minute', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
    ]);

    $this->actingAs($user)
        ->from(route('verification.notice'))
        ->post(route('verification.send'))
        ->assertRedirect(route('verification.notice'))
        ->assertSessionHas('status', 'verification-link-sent');

    $this->actingAs($user)
        ->from(route('verification.notice'))
        ->post(route('verification.send'))
        ->assertRedirect(route('verification.notice'))
        ->assertSessionHas('status', 'verification-link-throttled');

    Notification::assertSentToTimes($user, VerifyEmail::class, 1);
});

test('verification link stays valid when it is opened on a different host', function () {
    $user = User::factory()->unverified()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
    ]);

    URL::useOrigin('http://localhost');

    $verificationUrl = (new VerifyEmail)->toMail($user)->actionUrl;

    URL::useOrigin('http://127.0.0.1:8000');

    Event::fake();

    $this->actingAs($user)
        ->get($verificationUrl)
        ->assertRedirect(route('restaurant.dashboard'));

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});
