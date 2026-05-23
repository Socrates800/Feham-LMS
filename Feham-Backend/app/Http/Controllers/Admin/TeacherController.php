<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeacherResource;
use App\Models\Section;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TeacherController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            TeacherResource::collection(
                Teacher::with(['user', 'classSections.schoolClass'])->get()
            )
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string',
            'cnic' => 'nullable|string',
            'subject_specialization' => 'nullable|string',
            'base_salary' => 'nullable|numeric|min:0',
            'joining_date' => 'nullable|date',
            'employee_code' => 'nullable|string',
            'section_ids' => 'nullable|array',
            'section_ids.*' => 'exists:sections,id',
        ]);

        $teacher = DB::transaction(function () use ($data, $request) {
            $user = User::create([
                'school_id' => $request->user()->school_id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'] ?? Str::random(12),
                'role' => 'teacher',
            ]);

            $teacher = Teacher::create([
                'school_id' => $request->user()->school_id,
                'user_id' => $user->id,
                'employee_code' => $data['employee_code'] ?? null,
                'subject_specialization' => $data['subject_specialization'] ?? null,
                'phone' => $data['phone'] ?? null,
                'cnic' => $data['cnic'] ?? null,
                'base_salary' => $data['base_salary'] ?? 0,
                'joining_date' => $data['joining_date'] ?? null,
            ]);

            $this->syncClassSections($teacher, $data['section_ids'] ?? []);

            return $teacher;
        });

        return response()->json(
            new TeacherResource($teacher->load(['user', 'classSections.schoolClass'])),
            201
        );
    }

    public function show(Teacher $teacher): JsonResponse
    {
        return response()->json(
            new TeacherResource($teacher->load(['user', 'classSections.schoolClass']))
        );
    }

    public function update(Request $request, Teacher $teacher): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string',
            'cnic' => 'nullable|string',
            'subject_specialization' => 'nullable|string',
            'base_salary' => 'nullable|numeric|min:0',
            'joining_date' => 'nullable|date',
            'employee_code' => 'nullable|string',
            'section_ids' => 'nullable|array',
            'section_ids.*' => 'exists:sections,id',
        ]);

        DB::transaction(function () use ($data, $teacher) {
            if (isset($data['name'])) {
                $teacher->user->update(['name' => $data['name']]);
                unset($data['name']);
            }

            $sectionIds = $data['section_ids'] ?? null;
            unset($data['section_ids']);

            $teacher->update($data);

            if ($sectionIds !== null) {
                $this->syncClassSections($teacher, $sectionIds);
            }
        });

        return response()->json(
            new TeacherResource($teacher->fresh()->load(['user', 'classSections.schoolClass']))
        );
    }

    public function destroy(Teacher $teacher): JsonResponse
    {
        Section::where('class_teacher_id', $teacher->id)->update(['class_teacher_id' => null]);
        $teacher->user->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function syncClassSections(Teacher $teacher, array $sectionIds): void
    {
        Section::where('class_teacher_id', $teacher->id)->update(['class_teacher_id' => null]);

        if ($sectionIds !== []) {
            Section::whereIn('id', $sectionIds)->update(['class_teacher_id' => $teacher->id]);
        }
    }
}
