<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function helpful(User $user, Review $review): bool
    {
        return $user->isCustomer() && $user->id !== $review->customer_id;
    }
}
