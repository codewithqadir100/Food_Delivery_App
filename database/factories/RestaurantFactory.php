<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\RestaurantCategory;
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
}
