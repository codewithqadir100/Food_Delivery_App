<?php

declare(strict_types=1);

namespace App\Http\Requests\Customer;

use App\Services\ReviewService;
use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCustomer() === true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:'.ReviewService::COMMENT_MAX],
        ];
    }
}
