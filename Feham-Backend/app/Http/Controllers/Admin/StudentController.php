<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['section.schoolClass', 'parentUser'])
            ->withCount('challans');

        if ($request->search) {
            $q = $request->search;
            $query->where(fn ($b) => $b
                ->where('name', 'like', "%{$q}%")
                ->orWhere('roll_number', 'like', "%{$q}%")
                ->orWhere('guardian_name', 'like', "%{$q}%")
                ->orWhere('guardian_phone', 'like', "%{$q}%"));
        }
        if ($request->section_id) {
            $query->where('section_id', $request->section_id);
        }
        if ($request->school_class_id) {
            $query->whereHas('section', fn ($s) => $s->where('school_class_id', $request->school_class_id));
        }
        if ($request->gender) {
            $query->where('gender', $request->gender);
        }

        return response()->json(
            StudentResource::collection($query->orderBy('roll_number')->get())
        );
    }

    public function nextRollNumber(Request $request): JsonResponse
    {
        $schoolId = $request->user()->school_id;
        $last = Student::where('school_id', $schoolId)->orderByDesc('id')->value('roll_number');

        if ($last && preg_match('/(\d+)$/', $last, $m)) {
            $num = (int) $m[1] + 1;
            $pad = strlen($m[1]);
            $next = preg_replace('/\d+$/', str_pad((string) $num, $pad, '0', STR_PAD_LEFT), $last);
        } else {
            $count = Student::where('school_id', $schoolId)->count() + 1;
            $next = 'STU-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
        }

        return response()->json(['roll_number' => $next]);
    }

    public function store(Request $request): JsonResponse
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'roll_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('students', 'roll_number')->where('school_id', $schoolId),
            ],
            'name' => 'required|string|max:255',
            'guardian_name' => 'required|string|max:255',
            'guardian_phone' => 'required|string|max:20',
            'guardian_cnic' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'parent_email' => 'nullable|email|unique:users,email',
            'parent_password' => 'nullable|string|min:8',
        ]);

        $student = DB::transaction(function () use ($data, $schoolId) {
            $userId = null;
            if (! empty($data['parent_email'])) {
                $user = User::create([
                    'school_id' => $schoolId,
                    'name' => $data['guardian_name'],
                    'email' => $data['parent_email'],
                    'password' => $data['parent_password'] ?? Str::random(12),
                    'role' => 'parent',
                ]);
                $userId = $user->id;
            }

            return Student::create([
                'school_id' => $schoolId,
                'section_id' => $data['section_id'],
                'user_id' => $userId,
                'roll_number' => $data['roll_number'],
                'name' => $data['name'],
                'guardian_name' => $data['guardian_name'],
                'guardian_phone' => $data['guardian_phone'],
                'guardian_cnic' => $data['guardian_cnic'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'address' => $data['address'] ?? null,
            ]);
        });

        return response()->json(
            new StudentResource($student->load(['section.schoolClass', 'parentUser'])->loadCount('challans')),
            201
        );
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json(
            new StudentResource(
                $student->load(['section.schoolClass', 'parentUser'])->loadCount('challans')
            )
        );
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'section_id' => 'sometimes|exists:sections,id',
            'roll_number' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('students', 'roll_number')
                    ->where('school_id', $schoolId)
                    ->ignore($student->id),
            ],
            'name' => 'sometimes|string|max:255',
            'guardian_name' => 'sometimes|string|max:255',
            'guardian_phone' => 'sometimes|string|max:20',
            'guardian_cnic' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'parent_email' => [
                'nullable',
                'email',
                Rule::unique('users', 'email')->ignore($student->user_id),
            ],
            'parent_password' => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($data, $student, $schoolId, $request) {
            if ($request->has('parent_email') && ! empty($data['parent_email'])) {
                if ($student->user_id) {
                    $student->parentUser->update([
                        'email' => $data['parent_email'],
                        'name' => $data['guardian_name'] ?? $student->guardian_name,
                    ]);
                } else {
                    $user = User::create([
                        'school_id' => $schoolId,
                        'name' => $data['guardian_name'] ?? $student->guardian_name,
                        'email' => $data['parent_email'],
                        'password' => $data['parent_password'] ?? Str::random(12),
                        'role' => 'parent',
                    ]);
                    $student->user_id = $user->id;
                    $student->save();
                }
            }

            if (! empty($data['parent_password']) && $student->user_id) {
                $student->parentUser->update(['password' => $data['parent_password']]);
            }

            $fields = [
                'section_id', 'roll_number', 'name', 'guardian_name', 'guardian_phone',
                'guardian_cnic', 'date_of_birth', 'gender', 'address',
            ];
            $updates = [];
            foreach ($fields as $field) {
                if (array_key_exists($field, $data)) {
                    $updates[$field] = $data[$field];
                }
            }
            if ($updates !== []) {
                $student->update($updates);
            }
        });

        return response()->json(
            new StudentResource(
                $student->fresh()->load(['section.schoolClass', 'parentUser'])->loadCount('challans')
            )
        );
    }

    public function destroy(Student $student): JsonResponse
    {
        DB::transaction(function () use ($student) {
            $userId = $student->user_id;
            $student->delete();
            if ($userId) {
                User::where('id', $userId)->where('role', 'parent')->delete();
            }
        });

        return response()->json(['message' => 'Deleted']);
    }
}
