<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    public function impersonate(Request $request, School $school): JsonResponse
    {
        if (! $school->is_active) {
            return response()->json(['message' => 'Cannot impersonate a deactivated organization.'], 422);
        }

        $admin = User::where('school_id', $school->id)
            ->where('role', 'admin')
            ->orderBy('id')
            ->first();

        if (! $admin) {
            return response()->json(['message' => 'No school admin found for this organization.'], 422);
        }

        $token = $admin->createToken('feham-impersonation')->plainTextToken;

        return response()->json([
            'user' => new UserResource($admin),
            'school' => $school,
            'token' => $token,
            'impersonating' => true,
        ]);
    }
}
