<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->allowStatuses(['pending', 'approved', 'rejected', 'banned']);
    }

    public function down(): void
    {
        DB::table('users')->where('status', 'banned')->update(['status' => 'rejected']);

        $this->allowStatuses(['pending', 'approved', 'rejected']);
    }

    /**
     * @param  list<string>  $statuses
     */
    private function allowStatuses(array $statuses): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            $allowed = implode(', ', array_map(
                fn (string $status) => "'".$status."'",
                $statuses,
            ));

            DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM({$allowed}) NOT NULL DEFAULT 'approved'");

            return;
        }

        if ($driver !== 'sqlite') {
            return;
        }

        DB::statement('PRAGMA foreign_keys = OFF');

        Schema::table('users', function (Blueprint $table) {
            $table->string('status_tmp')->nullable();
        });

        DB::statement('UPDATE users SET status_tmp = status');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('users', function (Blueprint $table) use ($statuses) {
            $table->enum('status', $statuses)->default('approved');
        });

        DB::statement('UPDATE users SET status = status_tmp');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('status_tmp');
        });

        DB::statement('PRAGMA foreign_keys = ON');
    }
};
