<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Student;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherContextController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        $sectionIds = $teacher->accessibleSectionIds();

        $sections = Section::with('schoolClass')
            ->whereIn('id', $sectionIds)
            ->orderBy('school_class_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'school_class' => $s->schoolClass ? ['id' => $s->schoolClass->id, 'name' => $s->schoolClass->name] : null,
                'label' => ($s->schoolClass?->name ?? 'Class').' – Section '.$s->name,
            ]);

        $students = Student::with('section.schoolClass')
            ->whereIn('section_id', $sectionIds)
            ->orderBy('name')
            ->get()
            ->map(fn ($st) => [
                'id' => $st->id,
                'name' => $st->name,
                'roll_number' => $st->roll_number,
                'section_id' => $st->section_id,
                'label' => $st->name.' ('.$st->roll_number.')',
                'section' => $st->section ? [
                    'id' => $st->section->id,
                    'name' => $st->section->name,
                    'school_class' => $st->section->schoolClass ? ['name' => $st->section->schoolClass->name] : null,
                ] : null,
            ]);

        $subjects = Timetable::where('teacher_id', $teacher->id)
            ->distinct()
            ->pluck('subject')
            ->filter()
            ->values();

        return response()->json([
            'sections' => $sections,
            'students' => $students,
            'subjects' => $subjects,
        ]);
    }
}
