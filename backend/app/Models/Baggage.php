<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Baggage extends Model
{
    /** @use HasFactory<\Database\Factories\BaggageFactory> */
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'weight_kg',
        'tag_number',
        'status',
    ];

    protected $casts = [
        'weight_kg' => 'decimal:2',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
