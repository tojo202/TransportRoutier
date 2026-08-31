<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index()
    {
        return response()->json(Driver::with('agency')->get());
    }

    public function store(Request $request)
    {
        $driver = Driver::create($request->all());
        return response()->json($driver->load('agency'), 201);
    }

    public function show(Driver $driver)
    {
        return response()->json($driver->load('agency'));
    }

    public function update(Request $request, Driver $driver)
    {
        $driver->update($request->all());
        return response()->json($driver);
    }

    public function destroy(Driver $driver)
    {
        $driver->delete();
        return response()->json(null, 204);
    }
}
