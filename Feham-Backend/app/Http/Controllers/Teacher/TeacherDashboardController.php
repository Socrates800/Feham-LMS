<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Resources\HomeworkResource;
use App\Models\Homework;
use App\Models\Period;
use App\Models\Remark;
use App\Models\Student;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class TeacherDashboardController extends Controller
{
    private const DAY_ORDER = [
        'Monday' => 1,
        'Tuesday' => 2,
        'Wednesday' => 3,
        'Thursday' => 4,
        'Friday' => 5,
        'Saturday' => 6,
    ];

    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        $today = now()->format('l');
        $sectionIds = $teacher->accessibleSectionIds();

        $scheduleToday = Timetable::with(['section.schoolClass', 'period'])
            ->where('teacher_id', $teacher->id)
            ->where('day', $today)
            ->orderBy('period_id')
            ->get();

        $weeklySchedule = Timetable::with(['section.schoolClass', 'period'])
            ->where('teacher_id', $teacher->id)
            ->get();

        $weeklySchedule = $this->sortByWeekday($weeklySchedule);

        $homework = Homework::with('section.schoolClass')
            ->where('teacher_id', $teacher->id)
            ->latest()
            ->limit(10)
            ->get();

        $remarks = Remark::with('student.section.schoolClass')
            ->where('teacher_id', $teacher->id)
            ->latest()
            ->limit(10)
            ->get();

        $homeworkTotal = Homework::where('teacher_id', $teacher->id)->count();
        $homeworkUpcoming = Homework::where('teacher_id', $teacher->id)
            ->whereDate('due_date', '>=', now()->toDateString())
            ->count();

        $remarksTotal = Remark::where('teacher_id', $teacher->id)->count();
        $remarksUnread = Remark::where('teacher_id', $teacher->id)->where('is_read', false)->count();

        $studentsCount = $sectionIds
            ? Student::whereIn('section_id', $sectionIds)->count()
            : 0;

        return response()->json([
            'stats' => [
                'today_periods' => $scheduleToday->count(),
                'weekly_periods' => $weeklySchedule->count(),
                'assigned_sections' => count($sectionIds),
                'students' => $studentsCount,
                'homework_total' => $homeworkTotal,
                'homework_upcoming' => $homeworkUpcoming,
                'remarks_total' => $remarksTotal,
                'remarks_unread' => $remarksUnread,
            ],
            'schedule' => $scheduleToday,
            'homework' => HomeworkResource::collection($homework),
            'remarks' => $remarks,
        ]);
    }

    public function schedule(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        $schedule = Timetable::with(['section.schoolClass', 'period'])
            ->where('teacher_id', $teacher->id)
            ->get();

        $periods = Period::where('school_id', $teacher->school_id)
            ->orderBy('order_index')
            ->get();

        return response()->json([
            'periods' => $periods,
            'entries' => $this->sortByWeekday($schedule)->values(),
        ]);
    }

    private function sortByWeekday(Collection $entries): Collection
    {
        return $entries->sortBy(function ($entry) {
            $day = self::DAY_ORDER[$entry->day] ?? 99;
            $period = $entry->period?->order_index ?? $entry->period_id ?? 0;

            return $day * 1000 + $period;
        });
    }
}
