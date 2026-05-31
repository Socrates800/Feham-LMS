<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\TeacherLeaveRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        return response()->json(
            TeacherLeaveRequest::with(['teacher.user', 'reviewer'])
                ->where('teacher_id', $teacher->id)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        $data = $request->validate([
            'leave_type' => ['required', Rule::in(['casual', 'sick', 'emergency', 'unpaid', 'other'])],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $leaveRequest = TeacherLeaveRequest::create([
            ...$data,
            'school_id' => $request->user()->school_id,
            'teacher_id' => $teacher->id,
            'status' => 'pending',
        ]);

        return response()->json($leaveRequest->load(['teacher.user', 'reviewer']), 201);
    }
}
