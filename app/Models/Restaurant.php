<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'address',
        'description',
        'restaurant_category_id',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function restaurantCategory (){
        return $this->belongsTo(RestaurantCategory::class);
    }

    public function menuCategories (){
        return $this->hasMany(MenuCategory::class);
    }

    public function menuItems (){
        return $this->hasMany(MenuItem::class);
    }
}
