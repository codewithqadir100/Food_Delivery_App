<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Order extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_PREPARING = 'preparing';

    public const STATUS_READY = 'ready';

    public const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';

    public const STATUS_DELIVERED = 'delivered';

    public const STATUS_CANCELLED = 'cancelled';

    /** Statuses that still count as "in progress" for a restaurant/customer. */
    public const ACTIVE_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_PREPARING,
        self::STATUS_READY,
        self::STATUS_OUT_FOR_DELIVERY,
    ];

    public const FULFILLMENT_DELIVERY = 'delivery';

    public const FULFILLMENT_PICKUP = 'pickup';

    public const FULFILLMENTS = [
        self::FULFILLMENT_DELIVERY,
        self::FULFILLMENT_PICKUP,
    ];

    /** Any of these can be chosen until the order is delivered or cancelled. */
    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_PREPARING,
        self::STATUS_READY,
        self::STATUS_OUT_FOR_DELIVERY,
        self::STATUS_DELIVERED,
        self::STATUS_CANCELLED,
    ];

    public const TERMINAL_STATUSES = [
        self::STATUS_DELIVERED,
        self::STATUS_CANCELLED,
    ];

    public const CANCELLED_BY_CUSTOMER = 'customer';

    public const CANCELLED_BY_RESTAURANT = 'restaurant';

    /** Customer may cancel only until the kitchen starts preparing. */
    public const CUSTOMER_CANCELLABLE_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
    ];

    protected $fillable = [
        'order_number',
        'customer_id',
        'restaurant_id',
        'customer_address_id',
        'status',
        'fulfillment_type',
        'subtotal',
        'delivery_fee',
        'total',
        'delivery_address',
        'notes',
        'wants_cutlery',
        'cancellation_reason',
        'cancelled_by',
        'review_prompt_dismissals',
        'review_prompt_dismissed_at',
        'confirmed_at',
        'delivered_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'total' => 'decimal:2',
            'wants_cutlery' => 'boolean',
            'confirmed_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'review_prompt_dismissals' => 'integer',
            'review_prompt_dismissed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $order->order_number ??= self::generateOrderNumber();
        });
    }

    public static function generateOrderNumber(): string
    {
        do {
            $number = 'ORD-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (self::where('order_number', $number)->exists());

        return $number;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(CustomerAddress::class, 'customer_address_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, self::TERMINAL_STATUSES, true);
    }

    public function canTransitionTo(string $status): bool
    {
        if ($this->isTerminal() || ! in_array($status, self::STATUSES, true)) {
            return false;
        }

        return $status !== $this->status;
    }

    public function nextStatuses(): array
    {
        if ($this->isTerminal()) {
            return [];
        }

        return array_values(array_filter(
            self::STATUSES,
            fn (string $status) => $status !== $this->status,
        ));
    }

    public function isActive(): bool
    {
        return in_array($this->status, self::ACTIVE_STATUSES, true);
    }

    public function canBeCancelledByCustomer(): bool
    {
        return in_array($this->status, self::CUSTOMER_CANCELLABLE_STATUSES, true);
    }

    /**
     * Fields both dashboards need when an order's status changes.
     *
     * @return array<string, mixed>
     */
    public function statusSnapshot(): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'fulfillment_type' => $this->fulfillment_type ?? self::FULFILLMENT_DELIVERY,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_by' => $this->cancelled_by,
            'cancelled_at' => $this->cancelled_at,
            'confirmed_at' => $this->confirmed_at,
            'delivered_at' => $this->delivered_at,
        ];
    }

    /**
     * Polling cursor overlapped by 2 seconds so second-precision timestamps are not skipped.
     */
    public static function statusFeedSince(?string $since): ?Carbon
    {
        if (! is_string($since) || trim($since) === '') {
            return null;
        }

        try {
            return Carbon::parse($since)->subSeconds(2);
        } catch (\Throwable) {
            return null;
        }
    }
}
