<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{

    protected $fillable = [
        'restaurant_id',
        'menu_category_id',
        'name',
        'description',
        'price',
        'image',
        'is_available',
    ];

    public function restaurant (){
        return $this->belongsTo(Restaurant::class);
    }

    public function menuCategory (){
        return $this->belongsTo(MenuCategory::class);
    }
}
