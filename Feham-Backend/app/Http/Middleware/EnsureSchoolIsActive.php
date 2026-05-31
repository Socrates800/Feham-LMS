<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSchoolIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->school_id && $user->role !== 'super_admin') {
            $school = $user->school;
            if ($school && ! $school->is_active) {
                return response()->json([
                    'message' => 'This school account has been deactivated. Contact platform support.',
                ], 403);
            }
        }

        return $next($request);
    }
}
