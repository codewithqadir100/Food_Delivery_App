<?php

declare(strict_types=1);

namespace App\Http\Requests\Restaurant;

use App\Services\ReviewService;
use Illuminate\Foundation\Http\FormRequest;

class StoreReviewReplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $review = $this->route('review');

        return $review !== null && ($this->user()?->can('reply', $review) ?? false);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'reply' => trim((string) $this->input('reply')),
        ]);
    }

    public function rules(): array
    {
        return [
            'reply' => ['required', 'string', 'max:'.ReviewService::COMMENT_MAX],
        ];
    }
}
