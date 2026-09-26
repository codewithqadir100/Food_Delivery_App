<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole('restaurant');
    }

    public function rules(): array
    {
        $imageRules = $this->isMethod('post') 
            ? 'required|image|mimes:jpeg,png,jpg|max:2048'
            : 'nullable|image|mimes:jpeg,png,jpg|max:2048';

        return [
            'menu_category_id' => [
                'required',
                'exists:menu_categories,id',
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
            'image' => $imageRules,
        ];
    }

    public function messages(): array
    {
        return [
            'menu_category_id.required' => 'Please select a category',
            'menu_category_id.exists' => 'Selected category does not exist',
            'name.required' => 'Item name is required',
            'name.max' => 'Item name must not exceed 100 characters',
            'description.max' => 'Description must not exceed 500 characters',
            'price.required' => 'Price is required',
            'price.numeric' => 'Price must be a valid number',
            'price.min' => 'Price must be at least 0',
            'image.required' => 'Please upload an image',
            'image.image' => 'File must be an image',
            'image.mimes' => 'Image must be JPEG, PNG, or JPG',
            'image.max' => 'Image must not exceed 2MB',
        ];
    }
}