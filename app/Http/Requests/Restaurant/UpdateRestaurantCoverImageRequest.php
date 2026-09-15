<?php declare(strict_types=1);

namespace App\Http\Requests\Restaurant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRestaurantCoverImageRequest extends FormRequest
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
            'cover_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'cover_image.required' => 'Please select a cover image',
            'cover_image.image' => 'Cover image must be a valid image file',
            'cover_image.mimes' => 'Cover image must be JPG, JPEG, PNG, or WebP format',
            'cover_image.max' => 'Cover image size must not exceed 5MB',
        ];
    }
}