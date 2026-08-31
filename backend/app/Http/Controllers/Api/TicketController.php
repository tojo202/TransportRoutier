<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index()
    {
        return response()->json(Ticket::with(['reservation.user', 'reservation.schedule.route'])->get());
    }

    public function store(Request $request)
    {
        $ticket = Ticket::create($request->all());
        return response()->json($ticket, 201);
    }

    public function show(Ticket $ticket)
    {
        return response()->json($ticket->load(['reservation.user', 'reservation.schedule.route']));
    }

    public function update(Request $request, Ticket $ticket)
    {
        $ticket->update($request->all());
        return response()->json($ticket);
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();
        return response()->json(null, 204);
    }
}
