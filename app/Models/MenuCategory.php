<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuCategory extends Model
{
    public function restaurant (){
        return $this->belongsTo(Restaurant::class);
    }

    public function menuItems (){
        return $this->hasMany(MenuItem::class);
    }
}
