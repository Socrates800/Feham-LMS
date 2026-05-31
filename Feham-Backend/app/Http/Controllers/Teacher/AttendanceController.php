<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Services\ChallanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    public function __construct(private ChallanService $challanService) {}

    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        $sectionIds = $teacher->accessibleSectionIds();

        $data = $request->validate([
            'section_id' => ['nullable', 'integer'],
            'date' => ['nullable', 'date'],
        ]);

        $sections = $this->sectionsForTeacher($sectionIds);
        $sectionId = (int) ($data['section_id'] ?? ($sections->first()['id'] ?? 0));
        $date = $data['date'] ?? now()->toDateString();

        if (! $sectionId || ! in_array($sectionId, $sectionIds, true)) {
            return response()->json([
                'sections' => $sections,
                'selected_section_id' => null,
                'date' => $date,
                'students' => [],
            ]);
        }

        $students = Student::with('section.schoolClass')
            ->where('section_id', $sectionId)
            ->orderBy('roll_number')
            ->get();

        $attendance = StudentAttendance::where('section_id', $sectionId)
            ->whereDate('attendance_date', $date)
            ->get()
            ->keyBy('student_id');

        return response()->json([
            'sections' => $sections,
            'selected_section_id' => $sectionId,
            'date' => $date,
            'students' => $students->map(fn (Student $student) => [
                'id' => $student->id,
                'roll_number' => $student->roll_number,
                'name' => $student->name,
                'guardian_name' => $student->guardian_name,
                'section' => $student->section ? [
                    'id' => $student->section->id,
                    'name' => $student->section->name,
                    'school_class' => $student->section->schoolClass ? [
                        'id' => $student->section->schoolClass->id,
                        'name' => $student->section->schoolClass->name,
                    ] : null,
                ] : null,
                'attendance' => $attendance->get($student->id) ? [
                    'id' => $attendance->get($student->id)->id,
                    'status' => $attendance->get($student->id)->status,
                    'remarks' => $attendance->get($student->id)->remarks,
                ] : null,
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        $sectionIds = $teacher->accessibleSectionIds();

        $data = $request->validate([
            'section_id' => ['required', 'integer'],
            'date' => ['required', 'date'],
            'records' => ['required', 'array'],
            'records.*.student_id' => ['required', 'integer'],
            'records.*.status' => ['required', Rule::in(['present', 'absent', 'late', 'leave'])],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
        ]);

        $sectionId = (int) $data['section_id'];
        if (! in_array($sectionId, $sectionIds, true)) {
            abort(403, 'You can only mark attendance for your assigned sections.');
        }

        $students = Student::where('section_id', $sectionId)->get()->keyBy('id');

        foreach ($data['records'] as $record) {
            $studentId = (int) $record['student_id'];
            $student = $students->get($studentId);

            if (! $student) {
                abort(403, 'One or more students are outside your assigned section.');
            }

            StudentAttendance::updateOrCreate(
                [
                    'student_id' => $studentId,
                    'attendance_date' => $data['date'],
                ],
                [
                    'school_id' => $teacher->school_id,
                    'section_id' => $sectionId,
                    'teacher_id' => $teacher->id,
                    'status' => $record['status'],
                    'remarks' => $record['remarks'] ?? null,
                ]
            );

            $this->challanService->syncLateAttendanceFine(
                $student,
                $data['date'],
                $record['status'] === 'late'
            );
        }

        return $this->index($request->merge([
            'section_id' => $sectionId,
            'date' => $data['date'],
        ]));
    }

    private function sectionsForTeacher(array $sectionIds)
    {
        return Section::with('schoolClass')
            ->whereIn('id', $sectionIds)
            ->orderBy('school_class_id')
            ->orderBy('name')
            ->get()
            ->map(fn (Section $section) => [
                'id' => $section->id,
                'name' => $section->name,
                'school_class' => $section->schoolClass ? [
                    'id' => $section->schoolClass->id,
                    'name' => $section->schoolClass->name,
                ] : null,
                'label' => ($section->schoolClass?->name ?? 'Class').' - Section '.$section->name,
            ]);
    }
}
