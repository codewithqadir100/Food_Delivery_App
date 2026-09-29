<?php

declare(strict_types=1);

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRestaurantHomeChefRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user?->isRestaurantOwner() === true
            && $user->hasVerifiedEmail()
            && ! $user->isRejected()
            && ! $user->isBanned()
            && $user->restaurant !== null;
    }

    public function rules(): array
    {
        return [
            'is_home_chef' => ['required', 'boolean'],
        ];
    }
}
