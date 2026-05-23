<?php

namespace App\Http\Middleware;

use App\Models\School;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $school = null;

        if ($host = $request->getHost()) {
            $parts = explode('.', $host);
            if (count($parts) > 2 && $parts[0] !== 'www') {
                $school = School::where('slug', $parts[0])->where('is_active', true)->first();
            }
        }

        if (! $school && $request->header('X-School-ID')) {
            $school = School::find($request->header('X-School-ID'));
        }

        if (! $school && $request->user()?->school_id) {
            $school = School::find($request->user()->school_id);
        }

        if ($school) {
            app()->instance('currentSchool', $school);
        }

        return $next($request);
    }
}
