<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole('restaurant');
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:50',
                'unique:menu_categories,name,NULL,id,restaurant_id,' . auth()->user()->restaurant_id,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required',
            'name.max' => 'Category name must not exceed 50 characters',
            'name.unique' => 'This category name already exists for your restaurant',
        ];
    }
}