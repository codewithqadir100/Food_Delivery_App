<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RestaurantApprovalService
{
    public function approve(Restaurant $restaurant): void
    {
        DB::transaction(function () use ($restaurant) {
            $restaurant->update([
                'status' => Restaurant::STATUS_APPROVED,
                'approved_since' => $restaurant->approved_since ?? now(),
            ]);

            $restaurant->user?->update([
                'status' => User::STATUS_APPROVED,
            ]);
        });
    }

    public function approveIfPending(Restaurant $restaurant): void
    {
        $restaurant->loadMissing('user');

        if ($restaurant->isRejected() || $restaurant->user?->isRejected()) {
            return;
        }

        if ($restaurant->isApproved() && $restaurant->user?->isApproved()) {
            return;
        }

        $this->approve($restaurant);
    }

    public function reject(Restaurant $restaurant): void
    {
        DB::transaction(function () use ($restaurant) {
            $restaurant->update([
                'status' => Restaurant::STATUS_REJECTED,
            ]);

            $restaurant->user?->update([
                'status' => User::STATUS_REJECTED,
            ]);
        });
    }
}
