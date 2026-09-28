<?php declare(strict_types=1);

namespace App\Http\Requests\Customer;

use App\Services\CartService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCustomer() === true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('customer_address_id') === '' || $this->input('customer_address_id') === null) {
            $this->merge(['customer_address_id' => null]);
        }
    }

    public function rules(): array
    {
        $restaurant = $this->route('restaurant');
        $restaurantId = $restaurant instanceof \App\Models\Restaurant
            ? $restaurant->id
            : (is_numeric($restaurant) ? (int) $restaurant : null);

        $requiresAddress = !app(CartService::class)->isPickup($restaurantId);

        return [
            'customer_address_id' => [
                $requiresAddress ? 'required' : 'nullable',
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
