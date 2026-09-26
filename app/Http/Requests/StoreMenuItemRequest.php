<?php

namespace App\Http\Requests;

use App\Models\MenuItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', MenuItem::class) === true;
    }

    public function rules(): array
    {
        $restaurantId = $this->user()->restaurant->id;

        return [
            'menu_category_id' => [
                'required',
                'integer',
                Rule::exists('menu_categories', 'id')
                    ->where('restaurant_id', $restaurantId),
            ],

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'description' => [
                'nullable',
                'string',
                'max:500',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:99999.99',
            ],

            'image' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'menu_category_id.required' => 'Please select a category.',
            'menu_category_id.exists' => 'Selected category does not belong to your restaurant.',
            'name.required' => 'Item name is required.',
            'name.max' => 'Item name must not exceed 100 characters.',
            'description.max' => 'Description must not exceed 500 characters.',
            'price.required' => 'Price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price must be at least 0.',
            'image.required' => 'Please upload an image.',
            'image.image' => 'File must be an image.',
            'image.mimes' => 'Image must be JPEG, PNG, or JPG.',
            'image.max' => 'Image must not exceed 2MB.',
        ];
    }
}