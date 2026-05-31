<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SchoolResource;
use App\Http\Resources\UserResource;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = School::query()
            ->withCount([
                'students',
                'teachers',
                'admins',
            ])
            ->with(['primaryAdmin'])
            ->latest();

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('billing_status')) {
            $query->where('billing_status', $request->billing_status);
        }

        if ($request->filled('plan')) {
            $query->where('plan', $request->plan);
        }

        $schools = $query->paginate($request->integer('per_page', 20));

        return SchoolResource::collection($schools)->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'plan' => 'nullable|string|in:starter,standard,enterprise',
            'billing_status' => 'nullable|string|in:trial,active,past_due,cancelled',
            'subscription_ends_at' => 'nullable|date',
            'student_limit' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:8',
        ]);

        $result = DB::transaction(function () use ($data) {
            $slug = $this->uniqueSlug($data['name']);

            $school = School::create([
                'name' => $data['name'],
                'slug' => $slug,
                'address' => $data['address'] ?? null,
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? $data['admin_email'],
                'plan' => $data['plan'] ?? 'starter',
                'billing_status' => $data['billing_status'] ?? 'trial',
                'subscription_ends_at' => $data['subscription_ends_at'] ?? now()->addDays(30),
                'student_limit' => $data['student_limit'] ?? 500,
                'notes' => $data['notes'] ?? null,
                'is_active' => true,
            ]);

            $admin = User::create([
                'school_id' => $school->id,
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'password' => $data['admin_password'],
                'role' => 'admin',
            ]);

            return compact('school', 'admin');
        });

        $school = $result['school']->loadCount(['students', 'teachers', 'admins'])->load('primaryAdmin');

        return response()->json([
            'school' => new SchoolResource($school),
            'admin' => new UserResource($result['admin']),
        ], 201);
    }

    public function show(School $school): JsonResponse
    {
        $school->loadCount(['students', 'teachers', 'admins'])
            ->load(['primaryAdmin', 'admins']);

        return response()->json([
            'school' => new SchoolResource($school),
            'admins' => UserResource::collection($school->admins),
        ]);
    }

    public function update(Request $request, School $school): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'plan' => 'sometimes|string|in:starter,standard,enterprise',
            'billing_status' => 'sometimes|string|in:trial,active,past_due,cancelled',
            'subscription_ends_at' => 'nullable|date',
            'student_limit' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($data['name']) && $data['name'] !== $school->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $school->id);
        }

        $school->update($data);

        return response()->json(new SchoolResource(
            $school->fresh()->loadCount(['students', 'teachers', 'admins'])->load('primaryAdmin')
        ));
    }

    public function activate(School $school): JsonResponse
    {
        $school->update(['is_active' => true]);

        return response()->json(new SchoolResource($school->fresh()));
    }

    public function deactivate(School $school): JsonResponse
    {
        $school->update(['is_active' => false]);

        return response()->json(new SchoolResource($school->fresh()));
    }

    public function upsertAdmin(Request $request, School $school): JsonResponse
    {
        $admin = User::where('school_id', $school->id)
            ->where('role', 'admin')
            ->first();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($admin?->id)],
            'password' => ($admin ? 'nullable' : 'required').'|string|min:8',
        ]);

        if ($admin) {
            $admin->update([
                'name' => $data['name'],
                'email' => $data['email'],
                ...($data['password'] ? ['password' => $data['password']] : []),
            ]);
        } else {
            $admin = User::create([
                'school_id' => $school->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'admin',
            ]);
        }

        return response()->json([
            'admin' => new UserResource($admin->fresh()),
        ]);
    }

    private function uniqueSlug(string $name, ?int $exceptId = null): string
    {
        $slug = Str::slug($name);
        $base = $slug;
        $i = 1;

        while (
            School::where('slug', $slug)
                ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
                ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
