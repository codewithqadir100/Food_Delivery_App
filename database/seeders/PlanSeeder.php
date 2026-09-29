<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'code' => Plan::CODE_FREE,
                'name' => 'Free',
                'listing_tier' => Plan::TIER_STANDARD,
                'duration_days' => 30,
                'price_amount' => 0,
                'sort_order' => 1,
            ],
            [
                'code' => Plan::CODE_NORMAL,
                'name' => 'Normal',
                'listing_tier' => Plan::TIER_STANDARD,
                'duration_days' => 30,
                'price_amount' => null,
                'sort_order' => 2,
            ],
            [
                'code' => Plan::CODE_FEATURED,
                'name' => 'Featured',
                'listing_tier' => Plan::TIER_FEATURED,
                'duration_days' => 30,
                'price_amount' => null,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::query()->updateOrCreate(
                ['code' => $plan['code']],
                [
                    ...$plan,
                    'currency' => 'PKR',
                    'is_active' => true,
                ],
            );
        }
    }
}
