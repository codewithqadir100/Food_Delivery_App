<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class Restaurant extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const LISTING_HIDDEN = 'hidden';

    public const LISTING_AVAILABLE = 'available';

    public const LISTING_UNAVAILABLE = 'unavailable';

    protected $fillable = [
        'user_id',
        'name',
        'longitude',
        'latitude',
        'service_radius_km',
        'area_name',
        'city_name',
        'street_address',
        'description',
        'phone',
        'logo',
        'cover_image',
        'is_open',
        'status',
        'restaurant_category_id',
        'is_home_chef',
        'approved_since',
    ];

    protected $appends = [
        'logo_url',
        'cover_image_url',
    ];

    protected function casts(): array
    {
        return [
            'is_open' => 'boolean',
            'is_home_chef' => 'boolean',
            'approved_since' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurantCategory(): BelongsTo
    {
        return $this->belongsTo(RestaurantCategory::class);
    }

    public function menuCategories(): HasMany
    {
        return $this->hasMany(MenuCategory::class);
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeVisibleToCustomers(Builder $query): Builder
    {
        return $query
            ->where($query->getModel()->getTable().'.status', self::STATUS_APPROVED)
            ->whereHas('subscription', function (Builder $subscription) {
                $subscription->whereNotNull('activated_at');
            });
    }

    public function listingAvailability(): string
    {
        if (! $this->isApproved()) {
            return self::LISTING_HIDDEN;
        }

        $subscription = $this->relationLoaded('subscription')
            ? $this->subscription
            : $this->subscription()->first();

        if (! $subscription || $subscription->activated_at === null) {
            return self::LISTING_HIDDEN;
        }

        if ($subscription->isCurrentlyActive() && $this->is_open) {
            return self::LISTING_AVAILABLE;
        }

        return self::LISTING_UNAVAILABLE;
    }

    public function isOrderable(): bool
    {
        return $this->listingAvailability() === self::LISTING_AVAILABLE;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    protected function logoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->logo ? Storage::disk('public')->url($this->logo) : null,
        );
    }

    protected function coverImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->cover_image ? Storage::disk('public')->url($this->cover_image) : null,
        );
    }
}
