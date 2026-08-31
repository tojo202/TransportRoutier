<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Ticket;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'reservations');
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $query = null;

        if ($type === 'reservations') {
            $query = Reservation::with(['user', 'schedule.route']);
        } elseif ($type === 'payments') {
            $query = Payment::with('reservation.user');
        } elseif ($type === 'tickets') {
            $query = Ticket::with('reservation.user');
        } else {
            return response()->json([]);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);
        }

        return response()->json($query->get());
    }
}
