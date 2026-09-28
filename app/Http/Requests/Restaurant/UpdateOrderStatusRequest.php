<?php declare(strict_types=1);

namespace App\Http\Requests\Restaurant;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isRestaurantOwner() === true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'string',
                Rule::in(Order::STATUSES),
            ],
            'cancellation_reason' => ['required_if:status,' . Order::STATUS_CANCELLED, 'nullable', 'string', 'max:255'],
        ];
    }
}
