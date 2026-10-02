<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\RateLimiter;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    public const ROLE_CUSTOMER = 'customer';

    public const ROLE_RESTAURANT_OWNER = 'restaurant_owner';

    public const ROLE_ADMIN = 'admin';

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_BANNED = 'banned';

    protected $fillable = [
        'name',
        'email',
        'google_id',
        'email_verified_at',
        'phone',
        'password',
        'role',
        'status',
        'is_super_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    public function loginRouteName(): string
    {
        return self::loginRouteForRole($this->role);
    }

    public static function loginRouteForAccount(?string $account): string
    {
        return match ($account) {
            'restaurant' => 'restaurant.login',
            'admin' => 'admin.login',
            default => 'login',
        };
    }

    public static function loginRouteForRole(?string $role): string
    {
        return match ($role) {
            self::ROLE_RESTAURANT_OWNER => 'restaurant.login',
            self::ROLE_ADMIN => 'admin.login',
            default => 'login',
        };
    }

    public function isCustomer(): bool
    {
        return $this->role === self::ROLE_CUSTOMER;
    }

    public function isRestaurantOwner(): bool
    {
        return $this->role === self::ROLE_RESTAURANT_OWNER;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin === true;
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

    public function isBanned(): bool
    {
        return $this->status === self::STATUS_BANNED;
    }

    public function restaurant(): HasOne
    {
        return $this->hasOne(Restaurant::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class, 'customer_id');
    }

    public function primaryAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class, 'customer_id')->where('is_primary', true);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function wishlistedRestaurants(): BelongsToMany
    {
        return $this->belongsToMany(Restaurant::class, 'wishlists', 'customer_id', 'restaurant_id')
            ->withTimestamps();
    }

    public function canVerifyEmail(): bool
    {
        return $this->isCustomer() || $this->isRestaurantOwner();
    }

    public function emailVerificationMessage(): string
    {
        if ($this->isCustomer()) {
            return 'We sent a verification link to your email. Open it to finish creating your account. You can keep browsing, and ordering stays locked until this is confirmed.';
        }

        return 'We sent a verification link to your email. Open it to continue restaurant onboarding. Profile, location, and menu stay locked until this is confirmed.';
    }

    public function afterEmailVerifiedRoute(): string
    {
        return $this->isCustomer()
            ? 'customer.addresses.create'
            : 'restaurant.dashboard';
    }

    public function whenAlreadyVerifiedRoute(): string
    {
        return $this->isCustomer() ? 'home' : 'restaurant.dashboard';
    }

    public function sendEmailVerificationNotification(): bool
    {
        return RateLimiter::attempt(
            'email-verification:'.$this->getKey(),
            1,
            function (): bool {
                $this->notify(new VerifyEmail);

                return true;
            },
            60,
        ) !== false;
    }
}
