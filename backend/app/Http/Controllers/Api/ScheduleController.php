<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index()
    {
        return response()->json(Schedule::with(['route', 'vehicle', 'driver'])->get());
    }

    public function store(Request $request)
    {
        $schedule = Schedule::create($request->all());
        return response()->json($schedule->load(['route', 'vehicle', 'driver']), 201);
    }

    public function show(Schedule $schedule)
    {
        return response()->json($schedule->load(['route', 'vehicle', 'driver']));
    }

    public function update(Request $request, Schedule $schedule)
    {
        $schedule->update($request->all());
        return response()->json($schedule);
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return response()->json(null, 204);
    }
}
