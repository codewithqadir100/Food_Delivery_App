<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    protected $fillable = [
        'customer_id',
        'latitude',
        'longitude',
        'city_name',
        'area_name',
        'street_address',
        'is_primary',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_primary' => 'boolean',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    protected static function booted(): void
    {
        static::creating(function ($address) {
            if ($address->is_primary) {
                self::where('customer_id', $address->customer_id)->update(['is_primary' => false]);
            }
        });

        static::updating(function ($address) {
            if ($address->is_primary) {
                self::where('customer_id', $address->customer_id)
                    ->where('id', '!=', $address->id)
                    ->update(['is_primary' => false]);
            }
        });
    }
}