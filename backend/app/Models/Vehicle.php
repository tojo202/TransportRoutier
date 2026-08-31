<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate_number',
        'brand',
        'model',
        'capacity',
        'status',
        'agency_id'
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function latestGpsLocation()
    {
        return $this->hasOne(GpsLocation::class)->latest('recorded_at');
    }

    public function gpsLocations()
    {
        return $this->hasMany(GpsLocation::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
