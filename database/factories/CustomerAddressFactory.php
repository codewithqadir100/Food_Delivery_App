<?php

namespace Database\Factories;

use App\Models\CustomerAddress;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerAddressFactory extends Factory
{
    protected $model = CustomerAddress::class;

    public function definition(): array
    {
        return [
            'customer_id' => User::factory()->state(['role' => User::ROLE_CUSTOMER, 'status' => User::STATUS_APPROVED]),
            'latitude' => 24.8615,
            'longitude' => 67.0020,
            'city_name' => 'Karachi',
            'area_name' => 'Clifton',
            'street_address' => fake()->streetAddress(),
            'is_primary' => true,
        ];
    }

    public function farAway(): static
    {
        return $this->state([
            'latitude' => 31.5204,
            'longitude' => 74.3587,
            'city_name' => 'Lahore',
        ]);
    }
}
