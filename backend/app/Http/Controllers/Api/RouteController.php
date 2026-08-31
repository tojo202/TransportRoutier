<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index()
    {
        return response()->json(Route::all());
    }

    public function store(Request $request)
    {
        $route = Route::create($request->all());
        return response()->json($route, 201);
    }

    public function show(Route $route)
    {
        return response()->json($route);
    }

    public function update(Request $request, Route $route)
    {
        $route->update($request->all());
        return response()->json($route);
    }

    public function destroy(Route $route)
    {
        $route->delete();
        return response()->json(null, 204);
    }
}
