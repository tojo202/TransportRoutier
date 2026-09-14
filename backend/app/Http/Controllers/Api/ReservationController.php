<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Schedule;
use App\Models\Ticket;
use App\Models\Payment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with([
            'user',
            'schedule.route',
            'schedule.vehicle',
            'schedule.driver',
            'ticket',
            'payment',
            'baggages'
        ]);

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        } elseif ($request->user() && $request->user()->role === 'client') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('schedule_id')) {
            $query->where('schedule_id', $request->schedule_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'seat_number' => 'required|integer|min:1',
            'total_amount' => 'required|numeric',
        ]);

        $schedule = Schedule::with('route', 'vehicle', 'driver')->findOrFail($request->schedule_id);

        // Check if seat already taken
        $existing = Reservation::where('schedule_id', $schedule->id)
            ->where('seat_number', $request->seat_number)
            ->whereIn('status', ['confirmed', 'paid', 'pending'])
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Ce siège (' . $request->seat_number . ') est déjà réservé.'], 422);
        }

        $user = $request->user();
        $userId = $request->user_id ?: ($user ? $user->id : 1);

        // Create reservation
        $reservation = Reservation::create([
            'user_id' => $userId,
            'schedule_id' => $schedule->id,
            'seat_number' => $request->seat_number,
            'status' => $request->status ?? 'confirmed',
            'total_amount' => $request->total_amount,
        ]);

        // Decrement available seats if > 0
        if ($schedule->available_seats > 0) {
            $schedule->decrement('available_seats');
        }

        // Generate Ticket with unique number & QR Code payload
        $ticketNumber = 'TKT-' . strtoupper(Str::random(6)) . '-' . $request->seat_number;
        $qrCodePayload = json_encode([
            'ticket_number' => $ticketNumber,
            'reservation_id' => $reservation->id,
            'passenger_name' => $user ? $user->name : ($request->passenger_name ?? 'Client'),
            'route' => $schedule->route ? ($schedule->route->origin . ' → ' . $schedule->route->destination) : 'Trajet',
            'departure' => $schedule->departure_time ? $schedule->departure_time->format('d/m/Y H:i') : '',
            'seat' => $request->seat_number,
            'status' => 'valid'
        ]);

        $ticket = Ticket::create([
            'reservation_id' => $reservation->id,
            'ticket_number' => $ticketNumber,
            'qr_code' => $qrCodePayload,
            'status' => 'valid'
        ]);

        // Create payment record if method is specified
        $paymentMethod = $request->payment_method ?? 'wave';
        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'transaction_reference' => 'PAY-' . strtoupper(Str::random(10)),
            'amount' => $request->total_amount,
            'payment_method' => $paymentMethod,
            'status' => 'success',
        ]);

        // Send simulated Email and in-app Notification
        $clientUser = User::find($userId);
        $clientEmail = $clientUser ? $clientUser->email : 'client@transport.com';
        $clientName = $clientUser ? $clientUser->name : 'Client';

        $routeName = $schedule->route ? ($schedule->route->origin . ' → ' . $schedule->route->destination) : 'votre trajet';
        
        // In-app Notification
        Notification::create([
            'user_id' => $userId,
            'title' => '🎉 Réservation confirmée (' . $ticketNumber . ')',
            'message' => 'Votre billet pour ' . $routeName . ' (Siège ' . $request->seat_number . ') a été généré avec succès.',
            'type' => 'success',
            'is_read' => false
        ]);

        // Email simulation log
        Log::info("EMAIL NOTIFICATION SENT to {$clientEmail} [Subject: Confirmation de votre billet {$ticketNumber}] - Trajet: {$routeName}, Siège: {$request->seat_number}, Montant: {$request->total_amount} FCFA");

        return response()->json($reservation->load([
            'user',
            'schedule.route',
            'schedule.vehicle',
            'schedule.driver',
            'ticket',
            'payment'
        ]), 201);
    }

    public function show(Reservation $reservation)
    {
        return response()->json($reservation->load([
            'user',
            'schedule.route',
            'schedule.vehicle',
            'schedule.driver',
            'ticket',
            'payment',
            'baggages'
        ]));
    }

    public function update(Request $request, Reservation $reservation)
    {
        $reservation->update($request->all());
        return response()->json($reservation->load(['user', 'schedule.route', 'ticket', 'payment']));
    }

    public function destroy(Reservation $reservation)
    {
        // Cancel reservation and restore seat count
        if ($reservation->status !== 'cancelled') {
            $reservation->schedule()->increment('available_seats');
            $reservation->update(['status' => 'cancelled']);
            if ($reservation->ticket) {
                $reservation->ticket->update(['status' => 'cancelled']);
            }
        }
        return response()->json(['message' => 'Réservation annulée avec succès']);
    }
}
