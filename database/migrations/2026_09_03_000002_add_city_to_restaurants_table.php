<?php declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('restaurants', 'city')) {
            Schema::table('restaurants', function (Blueprint $table) {
                $table->string('city')->nullable()->after('address');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('restaurants', 'city')) {
            Schema::table('restaurants', function (Blueprint $table) {
                $table->dropColumn('city');
            });
        }
    }
};