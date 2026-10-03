<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

function profileCustomer(array $overrides = []): User
{
    return User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
        'name' => 'Ayesha Khan',
        'phone' => '03001234567',
        ...$overrides,
    ]);
}

test('a customer can view their profile', function () {
    $customer = profileCustomer();

    $this->actingAs($customer)
        ->get(route('customer.profile.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Profile')
            ->where('profile.name', 'Ayesha Khan')
            ->where('profile.email', $customer->email)
            ->where('profile.phone', '03001234567')
            ->where('profile.email_verified', true)
            ->missing('profile.password'));
});

test('a customer can update their name and phone without changing email', function () {
    $customer = profileCustomer();
    $email = $customer->email;

    $this->actingAs($customer)
        ->patch(route('customer.profile.update'), [
            'name' => 'Ayesha Ali',
            'phone' => '03007654321',
            'email' => 'changed@example.com',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect()
        ->assertSessionHas('success', 'Profile updated.');

    $customer->refresh();

    expect($customer->name)->toBe('Ayesha Ali')
        ->and($customer->phone)->toBe('03007654321')
        ->and($customer->email)->toBe($email);
});

test('profile update requires a name and phone', function () {
    $customer = profileCustomer();

    $this->actingAs($customer)
        ->from(route('customer.profile.index'))
        ->patch(route('customer.profile.update'), [
            'name' => '',
            'phone' => '',
        ])
        ->assertSessionHasErrors(['name', 'phone'])
        ->assertRedirect(route('customer.profile.index'));
});

test('a customer can change their password', function () {
    $customer = profileCustomer();

    $this->actingAs($customer)
        ->put(route('customer.profile.password'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect()
        ->assertSessionHas('success', 'Password updated.');

    expect(Hash::check('new-password', $customer->fresh()->password))->toBeTrue();
});

test('password change rejects the wrong current password', function () {
    $customer = profileCustomer();

    $this->actingAs($customer)
        ->from(route('customer.profile.index'))
        ->put(route('customer.profile.password'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertSessionHasErrors('current_password')
        ->assertRedirect(route('customer.profile.index'));

    expect(Hash::check('password', $customer->fresh()->password))->toBeTrue();
});

test('guests and other roles cannot open the customer profile', function () {
    $this->get(route('customer.profile.index'))
        ->assertRedirect(route('login'));

    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_APPROVED,
    ]);

    $this->actingAs($owner)
        ->get(route('customer.profile.index'))
        ->assertForbidden();
});
