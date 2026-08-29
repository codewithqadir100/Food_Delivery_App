<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RestaurantCategory;

class RestaurantCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Fast Food', 'slug' => 'fast-food'],
            ['name' => 'Pizza', 'slug' => 'pizza'],
            ['name' => 'Burgers', 'slug' => 'burgers'],
            ['name' => 'Chinese', 'slug' => 'chinese'],
            ['name' => 'Desi', 'slug' => 'desi'],
            ['name' => 'BBQ', 'slug' => 'bbq'],
            ['name' => 'Desserts', 'slug' => 'desserts'],
        ];

        foreach ($categories as $category) {
            RestaurantCategory::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}