<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MenuCategory;

class MenuCategoryPolicy
{
    public function update(User $user, MenuCategory $category): bool
    {
        return $user->id === $category->restaurant->user_id;
    }

    public function delete(User $user, MenuCategory $category): bool
    {
        return $user->id === $category->restaurant->user_id;
    }
}