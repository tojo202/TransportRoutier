<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        return response()->json(Vehicle::with('agency')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|unique:vehicles',
            'brand' => 'required|string',
            'model' => 'required|string',
            'capacity' => 'required|integer',
            'status' => 'required|string|in:Disponible,En maintenance,En voyage,Hors service',
            'agency_id' => 'required|exists:agencies,id'
        ]);

        $vehicle = Vehicle::create($validated);
        return response()->json($vehicle, 201);
    }

    public function show(string $id)
    {
        return response()->json(Vehicle::with('agency')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        
        $validated = $request->validate([
            'plate_number' => 'sometimes|string|unique:vehicles,plate_number,'.$id,
            'brand' => 'sometimes|string',
            'model' => 'sometimes|string',
            'capacity' => 'sometimes|integer',
            'status' => 'sometimes|string|in:Disponible,En maintenance,En voyage,Hors service',
            'agency_id' => 'sometimes|exists:agencies,id'
        ]);

        $vehicle->update($validated);
        return response()->json($vehicle);
    }

    public function destroy(string $id)
    {
        Vehicle::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
