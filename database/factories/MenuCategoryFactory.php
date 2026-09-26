<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuCategoryFactory extends Factory
{
    protected $model = MenuCategory::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'name' => fake()->word(),
        ];
    }
}
