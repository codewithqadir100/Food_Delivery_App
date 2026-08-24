<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    public function restaurant (){
        return $this->belongsTo(Restaurant::class);
    }

    public function menuCategory (){
        return $this->belongsTo(MenuCategory::class);
    }
}
