<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Remark;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RemarkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        return response()->json(
            Remark::with(['student.section.schoolClass'])
                ->where('teacher_id', $teacher->id)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'message' => 'required|string',
        ]);

        $this->ensureStudentAccess($teacher, (int) $data['student_id']);

        $remark = Remark::create([
            ...$data,
            'school_id' => $request->user()->school_id,
            'teacher_id' => $teacher->id,
            'is_read' => false,
        ]);

        return response()->json($remark->load('student.section.schoolClass'), 201);
    }

    public function show(Remark $remark): JsonResponse
    {
        $this->ensureOwnRemark(request()->user()->teacher, $remark);

        return response()->json($remark->load('student.section.schoolClass'));
    }

    public function destroy(Remark $remark): JsonResponse
    {
        $this->ensureOwnRemark(request()->user()->teacher, $remark);
        $remark->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function ensureStudentAccess($teacher, int $studentId): void
    {
        $sectionIds = $teacher->accessibleSectionIds();
        $allowed = Student::whereIn('section_id', $sectionIds)->where('id', $studentId)->exists();

        if (! $allowed) {
            throw ValidationException::withMessages([
                'student_id' => ['You can only remark on students in your assigned classes.'],
            ]);
        }
    }

    private function ensureOwnRemark($teacher, Remark $remark): void
    {
        if ($remark->teacher_id !== $teacher->id) {
            abort(403, 'Forbidden');
        }
    }
}
