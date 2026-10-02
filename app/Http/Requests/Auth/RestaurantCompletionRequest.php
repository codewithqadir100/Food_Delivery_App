<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RestaurantCompletionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isRestaurantOwner() === true
            && $this->user()->hasVerifiedEmail()
            && $this->user()->restaurant === null;
    }

    public function rules(): array
    {
        return [
            'restaurant_name' => ['required', 'string', 'max:255'],
            'restaurant_category_id' => ['required', 'exists:restaurant_categories,id'],
            'is_home_chef' => ['sometimes', 'boolean'],
            'phone' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
