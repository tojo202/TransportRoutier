<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agency;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Agency::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string',
            'manager_name' => 'nullable|string'
        ]);

        $agency = Agency::create($validated);
        return response()->json($agency, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $agency = Agency::findOrFail($id);
        return response()->json($agency);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $agency = Agency::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'manager_name' => 'nullable|string'
        ]);

        $agency->update($validated);
        return response()->json($agency);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $agency = Agency::findOrFail($id);
        $agency->delete();
        return response()->json(null, 204);
    }
}
