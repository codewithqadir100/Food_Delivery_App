<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('comment', 500)->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'created_at']);
            $table->index(['restaurant_id', 'rating']);
        });

        Schema::create('review_helpfuls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['review_id', 'customer_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedTinyInteger('review_prompt_dismissals')->default(0)->after('cancelled_by');
            $table->timestamp('review_prompt_dismissed_at')->nullable()->after('review_prompt_dismissals');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['review_prompt_dismissals', 'review_prompt_dismissed_at']);
        });

        Schema::dropIfExists('review_helpfuls');
        Schema::dropIfExists('reviews');
    }
};
