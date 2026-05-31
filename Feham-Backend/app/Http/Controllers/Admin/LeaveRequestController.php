<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherLeaveRequest;
use App\Services\SalaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveRequestController extends Controller
{
    public function __construct(private SalaryService $salaryService) {}

    public function index(Request $request): JsonResponse
    {
        $query = TeacherLeaveRequest::with(['teacher.user', 'reviewer']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->teacher_id) {
            $query->where('teacher_id', $request->teacher_id);
        }

        return response()->json($query->latest()->get());
    }

    public function update(Request $request, TeacherLeaveRequest $leaveRequest): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $leaveRequest->update([
            'status' => $data['status'],
            'admin_note' => $data['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if ($leaveRequest->leave_type === 'unpaid') {
            $this->salaryService->syncUnpaidLeaveDeductions(
                $leaveRequest->teacher_id,
                $leaveRequest->start_date->toDateString(),
                $leaveRequest->end_date->toDateString()
            );
        }

        return response()->json($leaveRequest->load(['teacher.user', 'reviewer']));
    }
}
