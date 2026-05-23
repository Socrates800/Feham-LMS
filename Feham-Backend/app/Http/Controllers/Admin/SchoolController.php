<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Challan;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SchoolController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $schoolId = $request->user()->school_id;
        $month = now()->format('Y-m');

        $challans = Challan::where('month', $month);
        $paid = (clone $challans)->where('status', 'paid')->count();
        $total = (clone $challans)->count();
        $revenue = (clone $challans)->where('status', 'paid')->sum('total_amount');

        $today = now()->format('l');
        $timetableToday = Timetable::with(['section.schoolClass', 'teacher.user', 'period'])
            ->where('day', $today)
            ->orderBy('period_id')
            ->limit(10)
            ->get();

        $recentChallans = Challan::with(['student.section.schoolClass'])
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => [
                'students' => Student::count(),
                'teachers' => Teacher::count(),
                'challans_paid' => $paid,
                'challans_total' => $total,
                'monthly_revenue' => $revenue,
            ],
            'recent_challans' => $recentChallans,
            'timetable_today' => $timetableToday,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $school = $request->user()->school;
        $school->update($request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'bank_account' => 'nullable|string',
            'bank_name' => 'nullable|string',
        ]));
        Cache::forget("school:{$school->id}");

        return response()->json($school);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate(['logo' => 'required|image|max:2048']);
        $school = $request->user()->school;

        if ($school->logo_path) {
            Storage::disk('public')->delete($school->logo_path);
        }

        $path = $request->file('logo')->store('school-logos', 'public');
        $school->update(['logo_path' => $path]);
        Cache::forget("school:{$school->id}");

        return response()->json([
            'logo_url' => Storage::disk('public')->url($path),
            'school' => $school->fresh(),
        ]);
    }
}
