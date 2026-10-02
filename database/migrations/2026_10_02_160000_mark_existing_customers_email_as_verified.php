<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'customer')
            ->whereNull('email_verified_at')
            ->update([
                'email_verified_at' => DB::raw('created_at'),
            ]);
    }

    public function down(): void
    {
        // Existing customers cannot be separated from customers who verified later.
    }
};
