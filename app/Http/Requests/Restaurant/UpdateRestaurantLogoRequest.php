<?php declare(strict_types=1);

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRestaurantLogoRequest extends FormRequest
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
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'logo.required' => 'Please select a logo image',
            'logo.image' => 'Logo must be a valid image file',
            'logo.mimes' => 'Logo must be JPG, JPEG, PNG, or WebP format',
            'logo.max' => 'Logo size must not exceed 2MB',
        ];
    }
}