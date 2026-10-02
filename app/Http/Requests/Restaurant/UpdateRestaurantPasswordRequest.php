<?php

declare(strict_types=1);

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateRestaurantPasswordRequest extends FormRequest
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
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
