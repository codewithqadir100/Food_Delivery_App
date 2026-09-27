<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuItemFactory extends Factory
{
    protected $model = MenuItem::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'menu_category_id' => MenuCategory::factory(),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 100, 2000),
            'image' => 'menu-items/placeholder.jpg',
            'is_available' => true,
        ];
    }

    public function unavailable(): static
    {
        return $this->state(['is_available' => false]);
    }
}
