<?php

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChallanResource;
use App\Http\Resources\HomeworkResource;
use App\Http\Resources\StudentResource;
use App\Models\Challan;
use App\Models\Homework;
use App\Models\Remark;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentPortalController extends Controller
{
    public function children(Request $request): JsonResponse
    {
        $students = Student::with('section.schoolClass')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json(StudentResource::collection($students));
    }

    public function challans(Request $request, int $studentId): JsonResponse
    {
        $this->authorizeStudent($request, $studentId);
        $challans = Challan::with('student')
            ->where('student_id', $studentId)
            ->latest()
            ->get();

        return response()->json(ChallanResource::collection($challans));
    }

    public function homework(Request $request, int $studentId): JsonResponse
    {
        $student = $this->authorizeStudent($request, $studentId);
        $homework = Homework::with('section.schoolClass')
            ->where('section_id', $student->section_id)
            ->latest()
            ->get();

        return response()->json(HomeworkResource::collection($homework));
    }

    public function remarks(Request $request, int $studentId): JsonResponse
    {
        $this->authorizeStudent($request, $studentId);
        $remarks = Remark::with('teacher.user')
            ->where('student_id', $studentId)
            ->latest()
            ->get();

        return response()->json($remarks);
    }

    public function markRemarkRead(Request $request, int $id): JsonResponse
    {
        $remark = Remark::findOrFail($id);
        $this->authorizeStudent($request, $remark->student_id);
        $remark->update(['is_read' => true]);

        return response()->json($remark);
    }

    private function authorizeStudent(Request $request, int $studentId): Student
    {
        $student = Student::where('id', $studentId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return $student;
    }
}
