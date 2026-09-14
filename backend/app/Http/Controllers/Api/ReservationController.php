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
use Illuminate\Support\Facades\Mail;
use App\Mail\TicketConfirmationMail;

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
        $userId = $request->user_id;

        // Contexte invité : création / récupération automatique d'un compte client
        $createdAccount = null;
        if (!$userId && $user) {
            $userId = $user->id;
        } elseif (!$userId && $request->filled('passenger_email')) {
            $client = User::firstOrCreate(
                ['email' => $request->passenger_email],
                [
                    'name' => $request->passenger_name ?? 'Client',
                    'password' => \Illuminate\Support\Facades\Hash::make('client@' . \Illuminate\Support\Str::random(6)),
                    'role' => 'client',
                ]
            );
            $userId = $client->id;
            if ($client->wasRecentlyCreated) {
                $createdAccount = $client;
            }
        }
        $userId = $userId ?: 1;

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

        $clientUser = User::find($userId);
        $clientEmail = $clientUser ? $clientUser->email : ($request->passenger_email ?? 'client@transport.com');
        $clientName = $clientUser ? $clientUser->name : ($request->passenger_name ?? 'Client');

        $routeName = $schedule->route ? ($schedule->route->origin . ' → ' . $schedule->route->destination) : 'votre trajet';

        // In-app Notification
        Notification::create([
            'user_id' => $userId,
            'title' => '🎉 Réservation confirmée (' . $ticketNumber . ')',
            'message' => 'Votre billet pour ' . $routeName . ' (Siège ' . $request->seat_number . ') a été généré avec succès.',
            'type' => 'success',
            'is_read' => false
        ]);

        // Send Email with elegant HTML template + inline QR Code
        $qrDataUrl = $this->buildQrDataUrl($qrCodePayload);

        try {
            Mail::to($clientEmail)->send(new TicketConfirmationMail([
                'title' => 'Réservation confirmée — Billet ' . $ticketNumber,
                'ticket_number' => $ticketNumber,
                'passenger_name' => $clientName,
                'origin' => $schedule->route->origin ?? 'Départ',
                'destination' => $schedule->route->destination ?? 'Arrivée',
                'departure_time' => $schedule->departure_time?->format('d/m/Y à H:i') ?? '',
                'arrival_time' => $schedule->arrival_time?->format('d/m/Y à H:i') ?? '',
                'duration_hours' => $schedule->route->estimated_duration_hours ?? '',
                'seat' => $request->seat_number,
                'vehicle' => ($schedule->vehicle->brand ?? '') . ' ' . ($schedule->vehicle->model ?? '') . ' — ' . ($schedule->vehicle->plate_number ?? ''),
                'total_amount' => $request->total_amount,
                'transaction_reference' => $payment->transaction_reference,
                'qr_code' => $qrDataUrl,
                'app_url' => config('app.url'),
            ]));
        } catch (\Throwable $e) {
            // Ne bloque jamais la réservation si l'email échoue (mailer = log en dev)
            Log::warning('Ticket mail sending failed: ' . $e->getMessage());
        }

        Log::info("EMAIL NOTIFICATION SENT to {$clientEmail} [Subject: Confirmation de votre billet {$ticketNumber}] - Trajet: {$routeName}, Siège: {$request->seat_number}, Montant: {$request->total_amount} FCFA");

        $responseData = $reservation->load([
            'user',
            'schedule.route',
            'schedule.vehicle',
            'schedule.driver',
            'ticket',
            'payment'
        ])->toArray();

        // Compte client créé contextuellement : on renvoie token + user pour connexion auto
        if ($createdAccount) {
            $responseData['account_created'] = true;
            $responseData['user'] = $createdAccount->only(['id', 'name', 'email', 'role']);
            $responseData['auth_token'] = $createdAccount->createToken('auth_token')->plainTextToken;
        }

        return response()->json($responseData, 201);
    }

    /**
     * Génère une data-URI PNG (QR Code) pour les emails / billet.
     */
    protected function buildQrDataUrl($payload): string
    {
        try {
            $qr = new \Endroid\QrCode\QrCode(
                (string) $payload,
                size: 260,
                margin: 8
            );
            $writer = new \Endroid\QrCode\Writer\PngWriter();
            $result = $writer->write($qr);

            return 'data:image/png;base64,' . base64_encode($result->getString());
        } catch (\Throwable $e) {
            Log::warning('QR generation failed: ' . $e->getMessage());
            return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"></svg>';
        }
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
