<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'customer';
    }

    public function rules(): array
    {
        return [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'city_name' => 'required|string|max:100',
            'area_name' => 'required|string|max:500',
            'street_address' => 'required|string|min:5|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'latitude.required' => 'Location latitude is required',
            'longitude.required' => 'Location longitude is required',
            'city_name.required' => 'City name is required',
            'area_name.required' => 'Area name is required',
            'street_address.required' => 'Street address is required',
            'street_address.min' => 'Street address must be at least 5 characters',
        ];
    }
}