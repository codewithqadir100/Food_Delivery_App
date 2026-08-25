<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\MenuCategory;
use App\Models\User;

class MenuCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MenuCategory $menuCategory): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isRestaurantOwner() || $user->isAdmin();
    }

    public function update(User $user, MenuCategory $menuCategory): bool
    {
        return $user->isAdmin() || $this->ownsCategory($user, $menuCategory);
    }

    public function delete(User $user, MenuCategory $menuCategory): bool
    {
        return $user->isAdmin() || $this->ownsCategory($user, $menuCategory);
    }

    private function ownsCategory(User $user, MenuCategory $menuCategory): bool
    {
        if (! $user->isRestaurantOwner() || ! $user->restaurant) {
            return false;
        }

        return $menuCategory->restaurant_id === $user->restaurant->id;
    }
}