<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GpsLocation;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class GpsLocationController extends Controller
{
    public function index(Request $request)
    {
        $vehicleId = $request->query('vehicle_id');
        
        // If searching history for a specific vehicle
        if ($vehicleId) {
            $locations = GpsLocation::with('vehicle')
                ->where('vehicle_id', $vehicleId)
                ->orderBy('recorded_at', 'desc')
                ->take(50) // Limit history
                ->get();
            return response()->json($locations);
        }

        // Get latest location for ALL vehicles that have one
        $vehicles = Vehicle::with(['agency', 'latestGpsLocation'])->get();
        
        $latestLocations = [];
        foreach ($vehicles as $vehicle) {
            if ($vehicle->latestGpsLocation) {
                $location = $vehicle->latestGpsLocation->toArray();
                $location['vehicle'] = $vehicle->toArray();
                unset($location['vehicle']['latest_gps_location']); // cleanup
                $latestLocations[] = $location;
            }
        }
        
        if (empty($latestLocations)) {
            $latestLocations = GpsLocation::with('vehicle.agency')->latest()->get();
        }

        return response()->json($latestLocations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'speed' => 'nullable|numeric',
            'recorded_at' => 'required|date',
        ]);
        
        $gpsLocation = GpsLocation::create($request->all());
        return response()->json($gpsLocation, 201);
    }

    public function show(GpsLocation $gpsLocation)
    {
        return response()->json($gpsLocation->load('vehicle'));
    }

    public function update(Request $request, GpsLocation $gpsLocation)
    {
        $gpsLocation->update($request->all());
        return response()->json($gpsLocation);
    }

    public function destroy(GpsLocation $gpsLocation)
    {
        $gpsLocation->delete();
        return response()->json(null, 204);
    }
}
