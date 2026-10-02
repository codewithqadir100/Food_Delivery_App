<?php

declare(strict_types=1);

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\Subscription;
use App\Models\User;
use App\Services\PaymentVerificationService;
use Database\Seeders\PlanSeeder;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;

beforeEach(function () {
    $this->seed(PlanSeeder::class);
});

function onboardedRestaurant(array $restaurantAttributes = [], array $userAttributes = []): Restaurant
{
    $restaurant = Restaurant::factory()->create(array_merge([
        'status' => Restaurant::STATUS_PENDING,
        'phone' => '03001234567',
        'is_open' => true,
    ], $restaurantAttributes));

    $restaurant->user->update(array_merge([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
        'email_verified_at' => now(),
    ], $userAttributes));

    $category = MenuCategory::factory()->create([
        'restaurant_id' => $restaurant->id,
    ]);

    MenuItem::factory()->create([
        'restaurant_id' => $restaurant->id,
        'menu_category_id' => $category->id,
    ]);

    return $restaurant->fresh(['user']);
}

test('restaurant registration requires email verification before profile access', function () {
    Notification::fake();

    $category = RestaurantCategory::factory()->create();

    $this->post(route('restaurant.register'), [
        'email' => 'new-owner@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'restaurant_name' => 'New Kitchen',
        'restaurant_category_id' => $category->id,
    ])->assertRedirect(route('verification.notice'));

    $user = User::query()->where('email', 'new-owner@example.com')->first();

    Notification::assertSentTo($user, VerifyEmail::class);

    $this->actingAs($user)
        ->get(route('restaurant.profile.edit'))
        ->assertRedirect(route('verification.notice'));
});

test('profile shows approved since as a date only after the restaurant is approved', function () {
    $restaurant = Restaurant::factory()->create([
        'status' => Restaurant::STATUS_PENDING,
        'approved_since' => null,
    ]);
    $restaurant->user->update([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($restaurant->user)
        ->get(route('restaurant.profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('restaurant.approved_since', null));

    $restaurant->update([
        'status' => Restaurant::STATUS_APPROVED,
        'approved_since' => '2026-09-26 14:38:31',
    ]);

    $this->actingAs($restaurant->user->fresh())
        ->get(route('restaurant.profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('restaurant.approved_since', '2026-09-26'));
});

test('onboarding checklist follows saved profile location category and item records', function () {
    $restaurant = Restaurant::factory()->create([
        'status' => Restaurant::STATUS_PENDING,
        'phone' => null,
        'latitude' => null,
        'longitude' => null,
        'city_name' => null,
    ]);
    $restaurant->user->update([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_PENDING,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($restaurant->user)
        ->get(route('restaurant.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('onboarding.profile', false)
            ->where('onboarding.location', false)
            ->where('onboarding.menu_category', false)
            ->where('onboarding.menu_item', false)
            ->where('onboarding.complete', false)
        );

    $restaurant->update([
        'phone' => '03001234567',
        'latitude' => 24.86,
        'longitude' => 67.00,
        'city_name' => 'Karachi',
        'service_radius_km' => 8,
    ]);

    $category = MenuCategory::factory()->create(['restaurant_id' => $restaurant->id]);
    MenuItem::factory()->create([
        'restaurant_id' => $restaurant->id,
        'menu_category_id' => $category->id,
    ]);

    $this->actingAs($restaurant->user->fresh())
        ->get(route('restaurant.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('onboarding.complete', true));
});

test('starting the free plan activates the subscription and approves a pending restaurant once', function () {
    $restaurant = onboardedRestaurant();

    $this->actingAs($restaurant->user)
        ->post(route('restaurant.subscription.store'), ['plan' => Plan::CODE_FREE])
        ->assertRedirect(route('restaurant.subscription.index'));

    $restaurant->refresh();

    expect($restaurant->status)->toBe(Restaurant::STATUS_APPROVED);
    expect($restaurant->user->fresh()->status)->toBe(User::STATUS_APPROVED);
    expect($restaurant->approved_since?->toDateString())->toBe(now()->toDateString());
    expect($restaurant->subscription->status)->toBe('active');
    expect($restaurant->subscription->activated_at)->not->toBeNull();

    $this->actingAs($restaurant->user->fresh())
        ->post(route('restaurant.subscription.store'), ['plan' => Plan::CODE_FREE])
        ->assertSessionHasErrors('plan');
});

test('a paid plan stays hidden until a super admin verifies the payment', function () {
    $restaurant = onboardedRestaurant();

    $this->actingAs($restaurant->user)
        ->post(route('restaurant.subscription.store'), ['plan' => Plan::CODE_NORMAL])
        ->assertRedirect(route('restaurant.subscription.index'));

    expect($restaurant->fresh()->status)->toBe(Restaurant::STATUS_PENDING);
    expect($restaurant->fresh()->approved_since)->toBeNull();
    expect($restaurant->fresh()->listingAvailability())->toBe(Restaurant::LISTING_HIDDEN);

    $payment = Payment::query()->where('restaurant_id', $restaurant->id)->first();
    expect($payment->status)->toBe(Payment::STATUS_PENDING);

    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => true,
    ]);

    $this->actingAs($admin)
        ->post(route('super-admin.payments.verify', $payment))
        ->assertRedirect();

    $restaurant->refresh();

    expect($payment->fresh()->status)->toBe(Payment::STATUS_VERIFIED);
    expect($restaurant->status)->toBe(Restaurant::STATUS_APPROVED);
    expect($restaurant->approved_since?->toDateString())->toBe(now()->toDateString());
    expect($restaurant->listingAvailability())->toBe(Restaurant::LISTING_AVAILABLE);
});

test('switching plans starts a new month instead of extending the current end date', function () {
    $restaurant = onboardedRestaurant();

    $this->actingAs($restaurant->user)
        ->post(route('restaurant.subscription.store'), ['plan' => Plan::CODE_FREE])
        ->assertRedirect(route('restaurant.subscription.index'));

    $originalEndsAt = $restaurant->fresh()->subscription->ends_at->copy();

    $this->actingAs($restaurant->user)
        ->post(route('restaurant.subscription.store'), ['plan' => Plan::CODE_NORMAL])
        ->assertRedirect(route('restaurant.subscription.index'));

    $payment = Payment::query()
        ->where('restaurant_id', $restaurant->id)
        ->where('status', Payment::STATUS_PENDING)
        ->first();

    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => true,
    ]);

    $this->actingAs($admin)
        ->post(route('super-admin.payments.verify', $payment))
        ->assertRedirect();

    $subscription = $restaurant->fresh()->subscription->load('plan');

    expect($subscription->plan->code)->toBe(Plan::CODE_NORMAL);
    expect($subscription->ends_at->between(
        now()->addDays(30)->subMinute(),
        now()->addDays(30)->addMinute(),
    ))->toBeTrue();
    expect($subscription->ends_at->lt($originalEndsAt->copy()->addDays(20)))->toBeTrue();
});

test('verifying the same plan again extends the current end date', function () {
    $restaurant = onboardedRestaurant();
    $plan = Plan::query()->where('code', Plan::CODE_NORMAL)->first();
    $endsAt = now()->addDays(10);

    $subscription = $restaurant->subscription()->create([
        'plan_id' => $plan->id,
        'status' => Subscription::STATUS_ACTIVE,
        'starts_at' => now()->subDays(20),
        'ends_at' => $endsAt,
        'activated_at' => now()->subDays(20),
    ]);

    $payment = Payment::query()->create([
        'restaurant_id' => $restaurant->id,
        'subscription_id' => $subscription->id,
        'plan_id' => $plan->id,
        'provider' => Payment::PROVIDER_MANUAL,
        'currency' => 'PKR',
        'status' => Payment::STATUS_PENDING,
    ]);

    app(PaymentVerificationService::class)->markVerified($payment);

    expect($subscription->fresh()->ends_at->between(
        $endsAt->copy()->addDays(30)->subMinute(),
        $endsAt->copy()->addDays(30)->addMinute(),
    ))->toBeTrue();
});

test('payment verification does not approve a rejected restaurant', function () {
    $restaurant = onboardedRestaurant();
    $restaurant->update(['status' => Restaurant::STATUS_REJECTED]);
    $restaurant->user->update(['status' => User::STATUS_REJECTED]);

    $plan = Plan::query()->where('code', Plan::CODE_NORMAL)->first();
    $subscription = $restaurant->subscription()->create([
        'plan_id' => $plan->id,
        'status' => 'pending_payment',
    ]);
    $payment = Payment::query()->create([
        'restaurant_id' => $restaurant->id,
        'subscription_id' => $subscription->id,
        'plan_id' => $plan->id,
        'provider' => Payment::PROVIDER_MANUAL,
        'currency' => 'PKR',
        'status' => Payment::STATUS_PENDING,
    ]);

    app(PaymentVerificationService::class)->markVerified($payment);

    expect($restaurant->fresh()->status)->toBe(Restaurant::STATUS_REJECTED);
    expect($restaurant->user->fresh()->status)->toBe(User::STATUS_REJECTED);
    expect($restaurant->fresh()->listingAvailability())->toBe(Restaurant::LISTING_HIDDEN);
});

test('super admin can manually approve, reject, and delete a restaurant without orders', function () {
    $restaurant = onboardedRestaurant();
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => true,
    ]);

    $this->actingAs($admin)
        ->post(route('super-admin.restaurants.approve', $restaurant))
        ->assertRedirect();

    expect($restaurant->fresh()->status)->toBe(Restaurant::STATUS_APPROVED);
    expect($restaurant->fresh()->approved_since)->not->toBeNull();
    expect($restaurant->fresh()->listingAvailability())->toBe(Restaurant::LISTING_HIDDEN);

    $this->actingAs($admin)
        ->post(route('super-admin.restaurants.reject', $restaurant))
        ->assertRedirect();

    expect($restaurant->fresh()->status)->toBe(Restaurant::STATUS_REJECTED);

    $this->actingAs($admin)
        ->delete(route('super-admin.restaurants.destroy', $restaurant))
        ->assertRedirect();

    $this->assertDatabaseMissing('restaurants', ['id' => $restaurant->id]);
    expect($restaurant->user->fresh()->status)->toBe(User::STATUS_BANNED);
});

test('super admin cannot delete a restaurant that has orders', function () {
    $restaurant = onboardedRestaurant();
    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
    ]);

    Order::query()->create([
        'customer_id' => $customer->id,
        'restaurant_id' => $restaurant->id,
        'status' => Order::STATUS_PENDING,
        'subtotal' => 100,
        'delivery_fee' => 50,
        'total' => 150,
    ]);

    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
        'status' => User::STATUS_APPROVED,
        'is_super_admin' => true,
    ]);

    $this->actingAs($admin)
        ->delete(route('super-admin.restaurants.destroy', $restaurant))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('restaurants', ['id' => $restaurant->id]);
});

test('google sign-in links an existing restaurant owner', function () {
    $owner = User::factory()->create([
        'role' => User::ROLE_RESTAURANT_OWNER,
        'status' => User::STATUS_APPROVED,
        'email' => 'owner@example.com',
        'email_verified_at' => null,
    ]);
    Restaurant::factory()->create([
        'user_id' => $owner->id,
        'status' => Restaurant::STATUS_APPROVED,
    ]);

    $googleOwner = (new Laravel\Socialite\Two\User)->map([
        'id' => 'google-owner',
        'name' => 'Owner',
        'email' => 'owner@example.com',
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($googleOwner);
    Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('restaurant.dashboard'));

    expect($owner->fresh()->google_id)->toBe('google-owner');
    expect($owner->fresh()->hasVerifiedEmail())->toBeTrue();
    expect($owner->fresh()->role)->toBe(User::ROLE_RESTAURANT_OWNER);
});

test('google sign-in does not convert a customer into a restaurant owner', function () {
    $customer = User::factory()->create([
        'role' => User::ROLE_CUSTOMER,
        'status' => User::STATUS_APPROVED,
        'email' => 'customer@example.com',
    ]);

    $googleCustomer = (new Laravel\Socialite\Two\User)->map([
        'id' => 'google-customer',
        'name' => 'Customer',
        'email' => 'customer@example.com',
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($googleCustomer);
    Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('restaurant.login'))
        ->assertSessionHasErrors('email');

    expect($customer->fresh()->role)->toBe(User::ROLE_CUSTOMER);
    expect($customer->fresh()->google_id)->toBeNull();
    $this->assertGuest();
});

test('google sign-in creates a verified restaurant owner who still needs restaurant details', function () {
    $googleUser = (new Laravel\Socialite\Two\User)->map([
        'id' => 'google-new',
        'name' => 'New Owner',
        'email' => 'new-google@example.com',
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($googleUser);
    Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('restaurant.register.complete'));

    $user = User::query()->where('email', 'new-google@example.com')->first();

    expect($user->role)->toBe(User::ROLE_RESTAURANT_OWNER);
    expect($user->hasVerifiedEmail())->toBeTrue();
    expect($user->restaurant)->toBeNull();
});
