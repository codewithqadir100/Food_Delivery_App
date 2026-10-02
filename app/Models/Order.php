<?php declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
            $number = 'ORD-' . now()->format('ymd') . '-' . Str::upper(Str::random(5));
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

    public function isTerminal(): bool
    {
        return in_array($this->status, self::TERMINAL_STATUSES, true);
    }

    public function canTransitionTo(string $status): bool
    {
        if ($this->isTerminal() || !in_array($status, self::STATUSES, true)) {
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
}
