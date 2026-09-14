<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'vehicle_id',
        'driver_id',
        'agency_id',
        'published_by',
        'departure_time',
        'arrival_time',
        'price',
        'available_seats',
        'status',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'price' => 'decimal:2',
    ];

    protected $appends = ['occupied_seats'];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->with('user')->orderBy('created_at', 'asc');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function getOccupiedSeatsAttribute()
    {
        return $this->reservations()
            ->whereIn('status', ['confirmed', 'paid', 'completed'])
            ->pluck('seat_number')
            ->toArray();
    }
}
