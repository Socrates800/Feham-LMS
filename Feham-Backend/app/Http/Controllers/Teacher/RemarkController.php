<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Remark;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RemarkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        return response()->json(
            Remark::with('student')
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

        $remark = Remark::create([
            ...$data,
            'school_id' => $request->user()->school_id,
            'teacher_id' => $teacher->id,
        ]);

        return response()->json($remark->load('student'), 201);
    }

    public function show(Remark $remark): JsonResponse
    {
        return response()->json($remark->load('student'));
    }

    public function destroy(Remark $remark): JsonResponse
    {
        $remark->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
