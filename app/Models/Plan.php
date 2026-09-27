<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    public const CODE_FREE = 'free';

    public const CODE_NORMAL = 'normal';

    public const CODE_FEATURED = 'featured';

    public const TIER_STANDARD = 'standard';

    public const TIER_FEATURED = 'featured';

    protected $fillable = [
        'code',
        'name',
        'listing_tier',
        'duration_days',
        'price_amount',
        'currency',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'duration_days' => 'integer',
            'price_amount' => 'decimal:2',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isFree(): bool
    {
        return $this->code === self::CODE_FREE;
    }

    public function isFeatured(): bool
    {
        return $this->listing_tier === self::TIER_FEATURED;
    }
}
