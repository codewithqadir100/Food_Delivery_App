<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    Notification::fake();

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '03001234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false));
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'phone' => '03001234567',
        'role' => 'customer',
        'email_verified_at' => null,
    ]);

    Notification::assertSentTo(
        User::query()->where('email', 'test@example.com')->first(),
        VerifyEmail::class,
    );
});
