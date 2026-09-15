<?php

declare(strict_types=1);

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRestaurantStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isRestaurantOwner() === true
            && $this->user()->isApproved()
            && $this->user()->restaurant !== null;
    }

    public function rules(): array
    {
        return [
            'is_open' => ['required', 'boolean'],
        ];
    }
}