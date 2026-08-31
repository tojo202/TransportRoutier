<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GpsLocation extends Model
{
    /** @use HasFactory<\Database\Factories\GpsLocationFactory> */
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'latitude',
        'longitude',
        'speed',
        'recorded_at'
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
