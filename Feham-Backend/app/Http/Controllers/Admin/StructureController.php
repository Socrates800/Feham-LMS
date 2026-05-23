<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PeriodResource;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StructureController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $schoolId = $request->user()->school_id;
        $school = School::find($schoolId);

        $classes = SchoolClass::with([
            'sections.classTeacher.user',
            'sections.students',
            'sections.timetables.teacher.user',
            'sections.timetables.period',
        ])
            ->where('school_id', $schoolId)
            ->orderBy('grade_level')
            ->get();

        $teachers = Teacher::with(['user', 'classSections.schoolClass'])
            ->where('school_id', $schoolId)
            ->get();

        $tree = [
            'school' => [
                'id' => $school?->id,
                'name' => $school?->name,
            ],
            'summary' => [
                'classes' => $classes->count(),
                'sections' => $classes->sum(fn ($c) => $c->sections->count()),
                'students' => $classes->sum(fn ($c) => $c->sections->sum(fn ($s) => $s->students->count())),
                'teachers' => $teachers->count(),
                'timetable_slots' => $classes->sum(
                    fn ($c) => $c->sections->sum(fn ($s) => $s->timetables->count())
                ),
            ],
            'classes' => $classes->map(fn ($class) => [
                'id' => $class->id,
                'name' => $class->name,
                'grade_level' => $class->grade_level,
                'sections' => $class->sections->map(fn ($section) => [
                    'id' => $section->id,
                    'name' => $section->name,
                    'class_teacher' => $section->classTeacher?->user?->name,
                    'students_count' => $section->students->count(),
                    'students' => $section->students->map(fn ($st) => [
                        'id' => $st->id,
                        'roll_number' => $st->roll_number,
                        'name' => $st->name,
                    ])->values(),
                    'timetable' => $section->timetables->map(fn ($tt) => [
                        'id' => $tt->id,
                        'day' => $tt->day,
                        'subject' => $tt->subject,
                        'period' => $tt->period?->name,
                        'time' => $tt->period
                            ? substr((string) $tt->period->start_time, 0, 5).'–'.substr((string) $tt->period->end_time, 0, 5)
                            : null,
                        'teacher' => $tt->teacher?->user?->name,
                    ])->values(),
                ])->values(),
            ])->values(),
            'teachers' => $teachers->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->user?->name,
                'subject_specialization' => $t->subject_specialization,
                'sections' => $t->classSections->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'class' => $s->schoolClass?->name,
                ])->values(),
            ])->values(),
            'periods' => PeriodResource::collection(
                \App\Models\Period::where('school_id', $schoolId)->orderBy('order_index')->get()
            )->resolve(),
        ];

        return response()->json($tree);
    }
}
