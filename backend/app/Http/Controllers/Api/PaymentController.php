<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    const METHODS = ['wave', 'orange_money', 'card', 'cash'];

    public function index(Request $request)
    {
        $query = Payment::with('reservation.user');

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('reservation_id')) {
            $query->where('reservation_id', $request->reservation_id);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:' . implode(',', self::METHODS),
            'status' => 'nullable|in:pending,success,failed,cancelled',
        ]);

        $payment = Payment::create([
            'reservation_id' => $request->reservation_id,
            'transaction_reference' => $request->transaction_reference ?? 'PAY-' . strtoupper(Str::random(10)),
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'status' => $request->status ?? 'pending',
        ]);

        return response()->json($payment->load('reservation.user'), 201);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load(['reservation.user', 'reservation.schedule.route', 'reservation.ticket']));
    }

    public function update(Request $request, Payment $payment)
    {
        $payment->update($request->all());
        return response()->json($payment);
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();
        return response()->json(null, 204);
    }

    /**
     * Simulation d'un paiement Mobile Money / Carte.
     * Crée le paiement au statut "pending" puis le valide immédiatement
     * comme un fournisseur de paiement le ferait (Wave, Orange Money, ...).
     */
    public function mobileMoney(Request $request)
    {
        $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:wave,orange_money,card',
            'phone' => 'nullable|string|max:30',
        ]);

        $reservation = Reservation::with('schedule')->findOrFail($request->reservation_id);
        $method = $request->payment_method;

        // Montant de contrôle : si absent, on prend le total de la réservation
        $amount = $request->amount;
        if ($reservation->total_amount && (float) $amount !== (float) $reservation->total_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Le montant ne correspond pas au total de la réservation (' . $reservation->total_amount . ' FCFA).'
            ], 422);
        }

        // Empêche les doublons : pas deux paiements "success" pour la même réservation
        $alreadyPaid = Payment::where('reservation_id', $reservation->id)
            ->where('status', 'success')
            ->first();
        if ($alreadyPaid) {
            return response()->json([
                'success' => false,
                'message' => 'Cette réservation a déjà été réglée (référence ' . $alreadyPaid->transaction_reference . ').',
                'payment' => $alreadyPaid
            ], 422);
        }

        // Simulation du push : toujours accepté en environnement de démonstration
        $transactionReference = strtoupper(str_replace('-', '', $method)) . '-' . Str::upper(Str::random(12));
        $confirmationCode = 'SIM-' . strtoupper(Str::random(6));

        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'transaction_reference' => $transactionReference,
            'amount' => $amount,
            'payment_method' => $method,
            'status' => 'pending',
        ]);

        // OTP simulé puis validation instantanée
        $payment->update(['status' => 'success']);

        return response()->json([
            'success' => true,
            'message' => 'Paiement ' . strtoupper($method) . ' validé avec succès.',
            'transaction_reference' => $transactionReference,
            'confirmation_code' => $confirmationCode,
            'payment' => $payment->load('reservation.user')
        ], 201);
    }

    /**
     * Confirmation manuelle d'un paiement en attente.
     */
    public function confirm(Payment $payment)
    {
        if ($payment->status === 'success') {
            return response()->json(['message' => 'Paiement déjà validé.', 'payment' => $payment->load('reservation.user')]);
        }

        $payment->update(['status' => 'success']);
        return response()->json([
            'message' => 'Paiement confirmé avec succès.',
            'payment' => $payment->load('reservation.user')
        ]);
    }

    public function methods()
    {
        return response()->json([
            'methods' => self::METHODS,
            'labels' => [
                'wave' => 'Wave Money',
                'orange_money' => 'Orange Money',
                'card' => 'Carte Bancaire',
                'cash' => 'Espèces (Guichet)',
            ]
        ]);
    }
}