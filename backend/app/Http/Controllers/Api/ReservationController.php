<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        return response()->json(Reservation::with(['user', 'schedule.route', 'schedule.vehicle', 'ticket', 'payment'])->latest()->get());
    }

    public function store(Request $request)
    {
        $reservation = Reservation::create($request->all());
        return response()->json($reservation->load(['user', 'schedule.route', 'schedule.vehicle', 'ticket', 'payment']), 201);
    }

    public function show(Reservation $reservation)
    {
        return response()->json($reservation->load(['user', 'schedule.route', 'schedule.vehicle', 'ticket', 'payment']));
    }

    public function update(Request $request, Reservation $reservation)
    {
        $reservation->update($request->all());
        return response()->json($reservation);
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->delete();
        return response()->json(null, 204);
    }
}
