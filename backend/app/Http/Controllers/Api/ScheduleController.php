<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Route;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = Schedule::with([
            'route',
            'vehicle.agency',
            'driver.agency',
            'driver.reviews',
            'reservations.user'
        ]);

        if ($request->filled('origin')) {
            $query->whereHas('route', function ($q) use ($request) {
                $q->where('origin', 'ilike', '%' . $request->origin . '%')
                  ->orWhere('origin', 'like', '%' . $request->origin . '%');
            });
        }

        if ($request->filled('destination')) {
            $query->whereHas('route', function ($q) use ($request) {
                $q->where('destination', 'ilike', '%' . $request->destination . '%')
                  ->orWhere('destination', 'like', '%' . $request->destination . '%');
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('departure_time', $request->date);
        }

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $query->orderBy('departure_time', 'asc');

        if ($request->has('page') || $request->boolean('paginate')) {
            $perPage = $request->get('per_page', 6);
            return response()->json($query->paginate($perPage));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'departure_time' => 'required',
            'price' => 'required|numeric',
        ]);

        $routeId = $request->route_id;
        // If route doesn't exist but origin & destination given, create route
        if (!$routeId && $request->filled('origin') && $request->filled('destination')) {
            $route = Route::firstOrCreate([
                'origin' => $request->origin,
                'destination' => $request->destination,
            ], [
                'distance_km' => $request->distance_km ?? 150,
                'estimated_duration_hours' => $request->estimated_duration_hours ?? 2.5,
                'price' => $request->price
            ]);
            $routeId = $route->id;
        }

        $vehicleId = $request->vehicle_id;
        if (!$vehicleId) {
            $vehicle = Vehicle::first();
            $vehicleId = $vehicle ? $vehicle->id : 1;
        }

        $driverId = $request->driver_id;
        if (!$driverId) {
            $user = $request->user();
            if ($user && $user->role === 'driver') {
                $driver = Driver::where('user_id', $user->id)->first();
                $driverId = $driver ? $driver->id : null;
            }
            if (!$driverId) {
                $driver = Driver::first();
                $driverId = $driver ? $driver->id : null;
            }
        }

        $vehicle = Vehicle::find($vehicleId);
        $capacity = $vehicle ? $vehicle->capacity : 19;
        $availableSeats = $request->available_seats ?? $capacity;

        $departureTime = \Carbon\Carbon::parse($request->departure_time);
        $arrivalTime = $request->filled('arrival_time')
            ? \Carbon\Carbon::parse($request->arrival_time)
            : $departureTime->copy()->addHours(3);

        $schedule = Schedule::create([
            'route_id' => $routeId,
            'vehicle_id' => $vehicleId,
            'driver_id' => $driverId,
            'departure_time' => $departureTime,
            'arrival_time' => $arrivalTime,
            'price' => $request->price,
            'available_seats' => $availableSeats,
            'status' => $request->status ?? 'scheduled',
        ]);

        return response()->json($schedule->load(['route', 'vehicle', 'driver']), 201);
    }

    public function show(Schedule $schedule)
    {
        return response()->json($schedule->load([
            'route',
            'vehicle.agency',
            'driver.agency',
            'driver.reviews.user',
            'reservations.user',
            'reservations.ticket'
        ]));
    }

    public function update(Request $request, Schedule $schedule)
    {
        $schedule->update($request->all());
        return response()->json($schedule->load(['route', 'vehicle', 'driver']));
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return response()->json(null, 204);
    }
}
