<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $allowedRoles = [];
        foreach ($roles as $roleParam) {
            foreach (explode('|', $roleParam) as $r) {
                $allowedRoles[] = trim($r);
            }
        }

        if (! in_array($user->role, $allowedRoles, true) && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé pour ce rôle.'], 403);
        }

        return $next($request);
    }
}

