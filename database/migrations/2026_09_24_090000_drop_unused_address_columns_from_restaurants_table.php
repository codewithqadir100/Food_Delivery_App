<?php declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The legacy `address` (required, no default) and `city` columns were
 * superseded by `street_address`, `area_name` and `city_name` (added in
 * later migrations) but were never removed. Because `address` is a
 * required column with no default value, restaurant registration fails
 * with:
 *   SQLSTATE[HY000]: General error: 1364 Field 'address' doesn't have a
 *   default value
 *
 * since RestaurantAuthController::storeRegister() never sets it. Dropping
 * both unused columns removes the duplication and fixes registration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            if (Schema::hasColumn('restaurants', 'address')) {
                $table->dropColumn('address');
            }

            if (Schema::hasColumn('restaurants', 'city')) {
                $table->dropColumn('city');
            }
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            if (!Schema::hasColumn('restaurants', 'address')) {
                $table->text('address')->nullable();
            }

            if (!Schema::hasColumn('restaurants', 'city')) {
                $table->string('city')->nullable();
            }
        });
    }
};
