<?php declare(strict_types=1);

namespace App\Policies;

use App\Models\Restaurant;
use App\Models\User;

class RestaurantPolicy
{
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, Restaurant $restaurant): bool
    {
        return $user->id === $restaurant->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isRestaurantOwner() && $user->isApproved();
    }

    public function update(User $user, Restaurant $restaurant): bool
    {
        return $user->id === $restaurant->user_id && $user->isApproved();
    }

    public function delete(User $user, Restaurant $restaurant): bool
    {
        return $user->id === $restaurant->user_id && $user->isApproved();
    }

    public function restore(User $user, Restaurant $restaurant): bool
    {
        return false;
    }

    public function forceDelete(User $user, Restaurant $restaurant): bool
    {
        return false;
    }
}