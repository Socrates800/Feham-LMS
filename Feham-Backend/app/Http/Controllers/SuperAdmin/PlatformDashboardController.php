<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SchoolResource;
use App\Models\Challan;
use App\Models\School;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $month = now()->format('Y-m');

        $stats = [
            'total_schools' => School::count(),
            'active_schools' => School::where('is_active', true)->count(),
            'inactive_schools' => School::where('is_active', false)->count(),
            'total_students' => Student::withoutGlobalScopes()->count(),
            'total_teachers' => Teacher::withoutGlobalScopes()->count(),
            'total_users' => User::whereNotNull('school_id')->count(),
            'monthly_revenue' => (float) Challan::withoutGlobalScopes()
                ->where('month', $month)
                ->where('status', 'paid')
                ->sum('total_amount'),
            'trial_schools' => School::where('billing_status', 'trial')->count(),
            'paid_schools' => School::where('billing_status', 'active')->count(),
        ];

        $recentSchools = School::query()
            ->withCount(['students', 'teachers'])
            ->with(['primaryAdmin'])
            ->latest()
            ->limit(8)
            ->get();

        $billingSummary = School::query()
            ->selectRaw('billing_status, COUNT(*) as count')
            ->groupBy('billing_status')
            ->pluck('count', 'billing_status');

        return response()->json([
            'stats' => $stats,
            'billing_summary' => $billingSummary,
            'recent_schools' => SchoolResource::collection($recentSchools),
        ]);
    }

    public function reports(): JsonResponse
    {
        $month = now()->format('Y-m');

        $topSchools = School::query()
            ->withCount('students')
            ->orderByDesc('students_count')
            ->limit(10)
            ->get(['id', 'name', 'slug', 'plan', 'billing_status', 'is_active']);

        $revenueBySchool = Challan::withoutGlobalScopes()
            ->selectRaw('school_id, SUM(total_amount) as revenue')
            ->where('month', $month)
            ->where('status', 'paid')
            ->groupBy('school_id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $schoolNames = School::whereIn('id', $revenueBySchool->pluck('school_id'))
            ->pluck('name', 'id');

        return response()->json([
            'top_schools_by_students' => $topSchools,
            'top_schools_by_revenue' => $revenueBySchool->map(fn ($row) => [
                'school_id' => $row->school_id,
                'school_name' => $schoolNames[$row->school_id] ?? 'Unknown',
                'revenue' => (float) $row->revenue,
            ]),
            'plans_breakdown' => School::query()
                ->selectRaw('plan, COUNT(*) as count')
                ->groupBy('plan')
                ->pluck('count', 'plan'),
        ]);
    }
}
