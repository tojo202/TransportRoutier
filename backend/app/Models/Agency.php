<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'manager_name',
    ];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
    
    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }
}
