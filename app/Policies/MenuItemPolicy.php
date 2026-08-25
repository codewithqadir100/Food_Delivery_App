<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\MenuItem;
use App\Models\User;

class MenuItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MenuItem $menuItem): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isRestaurantOwner() || $user->isAdmin();
    }

    public function update(User $user, MenuItem $menuItem): bool
    {
        return $user->isAdmin() || $this->ownsMenuItem($user, $menuItem);
    }

    public function delete(User $user, MenuItem $menuItem): bool
    {
        return $user->isAdmin() || $this->ownsMenuItem($user, $menuItem);
    }

    private function ownsMenuItem(User $user, MenuItem $menuItem): bool
    {
        if (! $user->isRestaurantOwner() || ! $user->restaurant) {
            return false;
        }

        return $menuItem->restaurant_id === $user->restaurant->id;
    }
}