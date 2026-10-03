<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('restaurants')
            ->where('status', 'approved')
            ->whereNull('approved_since')
            ->update([
                'approved_since' => DB::raw('created_at'),
            ]);
    }

    public function down(): void
    {
        // The original approval time cannot be told apart from this backfill.
    }
};
