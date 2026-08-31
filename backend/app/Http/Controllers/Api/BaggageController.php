<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Baggage;
use Illuminate\Http\Request;

class BaggageController extends Controller
{
    public function index()
    {
        return response()->json(Baggage::with('reservation.user')->latest()->get());
    }

    public function store(Request $request)
    {
        $baggage = Baggage::create($request->all());
        return response()->json($baggage->load('reservation.user'), 201);
    }

    public function show(Baggage $baggage)
    {
        return response()->json($baggage->load('reservation.user'));
    }

    public function update(Request $request, Baggage $baggage)
    {
        $baggage->update($request->all());
        return response()->json($baggage);
    }

    public function destroy(Baggage $baggage)
    {
        $baggage->delete();
        return response()->json(null, 204);
    }
}
