<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Support\Collection;

class WishlistService
{
    public function idsFor(?User $user): array
    {
        if (! $user?->isCustomer()) {
            return [];
        }

        return $user->wishlistedRestaurants()
            ->pluck('restaurants.id')
            ->all();
    }

    public function hasAny(?User $user): bool
    {
        if (! $user?->isCustomer()) {
            return false;
        }

        return $user->wishlistedRestaurants()->exists();
    }

    public function mark(Collection $restaurants, ?User $user): Collection
    {
        $saved = array_flip($this->idsFor($user));

        return $restaurants->each(function (Restaurant $restaurant) use ($saved): void {
            $restaurant->is_wishlisted = isset($saved[$restaurant->id]);
        });
    }

    public function add(User $user, Restaurant $restaurant): void
    {
        $user->wishlistedRestaurants()->syncWithoutDetaching([$restaurant->id]);
    }

    public function remove(User $user, Restaurant $restaurant): void
    {
        $user->wishlistedRestaurants()->detach($restaurant->id);
    }
}
