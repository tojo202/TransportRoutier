<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string'
        ]);

        $role = $request->role ?? 'client';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role
        ]);

        if ($role === 'driver') {
            Driver::create([
                'name' => $user->name,
                'phone' => $request->phone ?? '+221 77 000 00 00',
                'license_number' => 'PERMIS-' . rand(10000, 99999),
                'experience_years' => 5,
                'agency_id' => $request->agency_id ?? 1,
                'user_id' => $user->id
            ]);
        }

        $user->load('driver.agency');

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $driver = Driver::with('agency')->where('user_id', $user->id)->first();
        if (!$driver && $user->role === 'driver') {
            $driver = Driver::with('agency')->first();
        }
        $userData = $user->toArray();
        $userData['driver'] = $driver;

        return response()->json([
            'user' => $userData,
            'token' => $user->createToken('auth_token')->plainTextToken
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $driver = Driver::with('agency')->where('user_id', $user->id)->first();
            if (!$driver && $user->role === 'driver') {
                $driver = Driver::with('agency')->first();
            }
            $userData = $user->toArray();
            $userData['driver'] = $driver;
            return response()->json($userData);
        }
        return response()->json($user);
    }
}
