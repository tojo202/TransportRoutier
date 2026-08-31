<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        return response()->json(Payment::with('reservation.user')->latest()->get());
    }

    public function store(Request $request)
    {
        $payment = Payment::create($request->all());
        return response()->json($payment->load('reservation.user'), 201);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load('reservation.user'));
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
}
