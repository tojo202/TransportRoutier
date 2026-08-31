<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'origin',
        'destination',
        'distance_km',
        'estimated_duration_hours',
        'price'
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
