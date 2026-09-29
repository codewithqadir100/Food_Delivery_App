<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('reset password link screen can be rendered', function () {
    $response = $this->get('/forgot-password');

    $response->assertStatus(200);
});

test('reset password link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email])
        ->assertRedirect(route('password.request'))
        ->assertSessionHas('status');

    Notification::assertSentTo($user, ResetPassword::class);
});

test('reset password screen can be rendered', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $response = $this->get('/reset-password/'.$notification->token);

        $response->assertStatus(200);

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post('/reset-password', [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});

test('a restaurant owner resets a password from the emailed link', function () {
    Notification::fake();

    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_APPROVED,
        'email' => 'reset-owner@example.com',
    ]);

    $this->get(route('password.request', ['account' => 'restaurant']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Auth/ForgotPassword')
            ->where('loginRoute', 'restaurant.login'));

    $this->post(route('password.email'), [
        'email' => $owner->email,
        'account' => 'restaurant',
    ])->assertRedirect(route('password.request', ['account' => 'restaurant']));

    Notification::assertSentTo($owner, ResetPassword::class, function (ResetPassword $notification) use ($owner) {
        $this->get(route('password.reset', [
            'token' => $notification->token,
            'email' => $owner->email,
        ]))->assertOk();

        $this->post(route('password.store'), [
            'token' => $notification->token,
            'email' => $owner->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertSessionHasNoErrors()
            ->assertRedirect(route('restaurant.login'));

        return true;
    });

    $this->post(route('restaurant.login'), [
        'email' => $owner->email,
        'password' => 'new-password',
    ]);

    $this->assertAuthenticatedAs($owner);
});
