<?php declare(strict_types=1);

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCustomer() === true;
    }

    public function rules(): array
    {
        return [
            'customer_address_id' => [
                'required',
                'integer',
                Rule::exists('customer_addresses', 'id')->where('customer_id', $this->user()->id),
            ],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_address_id.required' => 'Please select a delivery address.',
            'customer_address_id.exists' => 'Please select a valid delivery address.',
        ];
    }
}
