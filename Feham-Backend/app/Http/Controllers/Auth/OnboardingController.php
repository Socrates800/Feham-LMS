<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OnboardingController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'school_name' => 'required|string|max:255',
            'school_address' => 'nullable|string',
            'school_phone' => 'nullable|string',
            'school_email' => 'nullable|email',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $result = DB::transaction(function () use ($data) {
            $slug = Str::slug($data['school_name']);
            $base = $slug;
            $i = 1;
            while (School::where('slug', $slug)->exists()) {
                $slug = $base.'-'.$i++;
            }

            $school = School::create([
                'name' => $data['school_name'],
                'slug' => $slug,
                'address' => $data['school_address'] ?? null,
                'phone' => $data['school_phone'] ?? null,
                'email' => $data['school_email'] ?? $data['admin_email'],
            ]);

            $user = User::create([
                'school_id' => $school->id,
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'password' => $data['password'],
                'role' => 'admin',
            ]);

            $token = $user->createToken('feham-api')->plainTextToken;

            return compact('school', 'user', 'token');
        });

        return response()->json([
            'user' => new UserResource($result['user']),
            'school' => $result['school'],
            'token' => $result['token'],
        ], 201);
    }
}
