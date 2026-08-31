<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'license_number',
        'experience_years',
        'agency_id'
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
