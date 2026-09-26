<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to admin login when visiting admin dashboard', function () {
    $response = $this->get(route('admin.dashboard'));

    $response->assertRedirect(route('admin.login'));
});

test('customers cannot access admin dashboard', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);

    $response = $this->actingAs($user)->get(route('admin.dashboard'));

    $response->assertForbidden();
});

test('pending sub-admins see pending dashboard', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_PENDING,
        'is_super_admin' => false,
    ]);

    $response = $this->actingAs($user)->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/PendingDashboard'));
});

test('approved sub-admins see admin dashboard', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => false,
    ]);

    $response = $this->actingAs($user)->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard'));
});

test('super admin sees admin dashboard with counts', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => true,
    ]);

    $response = $this->actingAs($user)->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('pendingRestaurantsCount')
            ->has('pendingAdminsCount')
        );
});

test('super admin can view pending restaurants and admins pages', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => true,
    ]);

    $this->actingAs($user)
        ->get(route('super-admin.restaurants.pending'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/VerifyRestaurants'));

    $this->actingAs($user)
        ->get(route('super-admin.admins.pending'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/VerifyAdmins'));
});

test('non-super admin cannot access super admin verification routes', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => false,
    ]);

    $this->actingAs($user)
        ->get(route('super-admin.restaurants.pending'))
        ->assertForbidden();

    $this->actingAs($user)
        ->get(route('super-admin.admins.pending'))
        ->assertForbidden();
});

test('admin can logout', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
    ]);

    $response = $this->actingAs($user)->post(route('admin.logout'));

    $this->assertGuest();
    $response->assertRedirect(route('admin.login'));
});
