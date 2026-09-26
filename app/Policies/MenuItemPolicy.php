<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MenuItem;

class MenuItemPolicy
{
    public function update(User $user, MenuItem $item): bool
    {
        return $user->id === $item->restaurant->user_id;
    }

    public function delete(User $user, MenuItem $item): bool
    {
        return $user->id === $item->restaurant->user_id;
    }
}