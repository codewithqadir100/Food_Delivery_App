<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    protected $fillable = [
        'order_id',
        'customer_id',
        'restaurant_id',
        'rating',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function helpfuls(): HasMany
    {
        return $this->hasMany(ReviewHelpful::class);
    }

    public function reviewerFirstName(): string
    {
        $name = trim((string) ($this->customer?->name ?? ''));

        if ($name === '') {
            return 'Customer';
        }

        return explode(' ', $name)[0];
    }
}
