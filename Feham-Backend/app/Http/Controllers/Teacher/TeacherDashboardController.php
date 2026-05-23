<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\Remark;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        $today = now()->format('l');

        $schedule = Timetable::with(['section.schoolClass', 'period'])
            ->where('teacher_id', $teacher->id)
            ->where('day', $today)
            ->orderBy('period_id')
            ->get();

        $homework = Homework::with('section.schoolClass')
            ->where('teacher_id', $teacher->id)
            ->latest()
            ->limit(10)
            ->get();

        $remarks = Remark::with('student')
            ->where('teacher_id', $teacher->id)
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'schedule' => $schedule,
            'homework' => $homework,
            'remarks' => $remarks,
        ]);
    }

    public function schedule(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        $schedule = Timetable::with(['section.schoolClass', 'period'])
            ->where('teacher_id', $teacher->id)
            ->orderBy('day')
            ->orderBy('period_id')
            ->get();

        return response()->json($schedule);
    }
}
