<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;

class ExpireSubscriptions extends Command
{
    protected $signature = 'restaurants:expire-subscriptions';

    protected $description = 'Mark active restaurant subscriptions as expired when their end date has passed';

    public function handle(): int
    {
        $count = Subscription::query()
            ->where('status', Subscription::STATUS_ACTIVE)
            ->whereNotNull('ends_at')
            ->where('ends_at', '<=', now())
            ->update(['status' => Subscription::STATUS_EXPIRED]);

        $this->info("Expired {$count} subscriptions.");

        return self::SUCCESS;
    }
}
