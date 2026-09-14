<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Reservation;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index()
    {
        return response()->json(Ticket::with([
            'reservation.user',
            'reservation.schedule.route',
            'reservation.schedule.vehicle',
            'reservation.schedule.driver'
        ])->latest()->get());
    }

    public function store(Request $request)
    {
        $ticket = Ticket::create($request->all());
        return response()->json($ticket, 201);
    }

    public function show(Ticket $ticket)
    {
        return response()->json($ticket->load([
            'reservation.user',
            'reservation.schedule.route',
            'reservation.schedule.vehicle',
            'reservation.schedule.driver'
        ]));
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

    /**
     * Scanner / Valider un billet par son code ou QR code (pour Chauffeur & Agent)
     */
    public function scanQr(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = trim($request->code);

        // Try searching by ticket_number, qr_code or id
        $ticket = Ticket::with([
            'reservation.user',
            'reservation.schedule.route',
            'reservation.schedule.vehicle',
            'reservation.schedule.driver'
        ])
        ->where('ticket_number', $code)
        ->orWhere('qr_code', 'like', '%' . $code . '%')
        ->first();

        if (!$ticket) {
            return response()->json([
                'valid' => false,
                'message' => '❌ Billet introuvable ou QR code invalide.'
            ], 404);
        }

        if ($ticket->status === 'cancelled') {
            return response()->json([
                'valid' => false,
                'ticket' => $ticket,
                'message' => '⚠️ Ce billet a été annulé.'
            ], 400);
        }

        if ($ticket->status === 'used') {
            return response()->json([
                'valid' => false,
                'ticket' => $ticket,
                'message' => '⚠️ Ce billet a déjà été utilisé (passager déjà embarqué).'
            ], 400);
        }

        // Validate ticket and mark as used if requested
        if ($request->boolean('mark_used', true)) {
            $ticket->update(['status' => 'used']);
        }

        return response()->json([
            'valid' => true,
            'message' => '✅ Billet validé avec succès ! Embarquement autorisé.',
            'ticket' => $ticket
        ]);
    }
}
