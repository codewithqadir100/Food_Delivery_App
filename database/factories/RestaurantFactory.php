<?php

namespace Database\Factories;

use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantFactory extends Factory
{
    protected $model = Restaurant::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_RESTAURANT_OWNER, 'status' => User::STATUS_APPROVED]),
            'restaurant_category_id' => RestaurantCategory::factory(),
            'name' => fake()->company(),
            'description' => fake()->sentence(),
            'phone' => fake()->phoneNumber(),
            'is_open' => true,
            'status' => Restaurant::STATUS_APPROVED,
            'latitude' => 24.8607,
            'longitude' => 67.0011,
            'service_radius_km' => 10,
            'city_name' => 'Karachi',
            'area_name' => 'Clifton',
            'street_address' => fake()->streetAddress(),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => Restaurant::STATUS_PENDING]);
    }

    public function closed(): static
    {
        return $this->state(['is_open' => false]);
    }

    public function withoutCoordinates(): static
    {
        return $this->state(['latitude' => null, 'longitude' => null]);
    }

    public function subscribed(string $code = Plan::CODE_NORMAL, bool $expired = false): static
    {
        return $this->afterCreating(function (Restaurant $restaurant) use ($code, $expired) {
            $plan = Plan::query()->firstOrCreate(
                ['code' => $code],
                [
                    'name' => ucfirst($code),
                    'listing_tier' => $code === Plan::CODE_FEATURED ? Plan::TIER_FEATURED : Plan::TIER_STANDARD,
                    'duration_days' => 30,
                    'price_amount' => $code === Plan::CODE_FREE ? 0 : null,
                    'currency' => 'PKR',
                    'is_active' => true,
                    'sort_order' => 1,
                ],
            );

            Subscription::query()->create([
                'restaurant_id' => $restaurant->id,
                'plan_id' => $plan->id,
                'status' => $expired ? Subscription::STATUS_EXPIRED : Subscription::STATUS_ACTIVE,
                'starts_at' => now()->subDay(),
                'ends_at' => $expired ? now()->subHour() : now()->addDays(30),
                'activated_at' => now()->subDay(),
            ]);
        });
    }
}
