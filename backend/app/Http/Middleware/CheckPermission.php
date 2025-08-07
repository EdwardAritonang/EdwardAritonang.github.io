<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $user = Auth::user();

        if (!$user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Insufficient permissions.'
            ], 403);
        }

        return $next($request);
    }
}