<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Restaurant;
use App\Models\User;

class RestaurantPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Restaurant $restaurant): bool
    {
        return $user->isAdmin() || $user->isCustomer() || $this->owns($user, $restaurant);
    }

    public function create(User $user): bool
    {
        return $user->isRestaurantOwner() || $user->isAdmin();
    }

    public function update(User $user, Restaurant $restaurant): bool
    {
        return $user->isAdmin() || $this->owns($user, $restaurant);
    }

    public function delete(User $user, Restaurant $restaurant): bool
    {
        return $user->isAdmin() || $this->owns($user, $restaurant);
    }

    private function owns(User $user, Restaurant $restaurant): bool
    {
        return $user->isRestaurantOwner() && $restaurant->user_id === $user->id;
    }
}