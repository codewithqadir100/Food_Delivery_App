<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@fooddelivery.com'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@fooddelivery.com',
                'password' => Hash::make('admin123'),
                'role' => User::ROLE_ADMIN,
                'is_super_admin' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}