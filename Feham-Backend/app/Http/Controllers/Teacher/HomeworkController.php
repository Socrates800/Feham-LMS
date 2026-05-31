<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Resources\HomeworkResource;
use App\Models\Homework;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class HomeworkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        return response()->json(
            HomeworkResource::collection(
                Homework::with('section.schoolClass')
                    ->where('teacher_id', $teacher->id)
                    ->latest()
                    ->get()
            )
        );
    }

    public function store(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date',
        ]);

        $this->ensureSectionAccess($teacher, (int) $data['section_id']);

        $homework = Homework::create([
            ...$data,
            'school_id' => $request->user()->school_id,
            'teacher_id' => $teacher->id,
        ]);

        return response()->json(new HomeworkResource($homework->load('section.schoolClass')), 201);
    }

    public function show(Homework $homework): JsonResponse
    {
        $this->ensureOwnHomework(request()->user()->teacher, $homework);

        return response()->json(new HomeworkResource($homework->load('section.schoolClass')));
    }

    public function update(Request $request, Homework $homework): JsonResponse
    {
        $teacher = $request->user()->teacher;
        $this->ensureOwnHomework($teacher, $homework);

        $homework->update($request->validate([
            'subject' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'due_date' => 'sometimes|date',
        ]));

        return response()->json(new HomeworkResource($homework->load('section.schoolClass')));
    }

    public function destroy(Homework $homework): JsonResponse
    {
        $this->ensureOwnHomework(request()->user()->teacher, $homework);
        $homework->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function ensureSectionAccess($teacher, int $sectionId): void
    {
        if (! in_array($sectionId, $teacher->accessibleSectionIds(), true)) {
            throw ValidationException::withMessages([
                'section_id' => ['You can only assign homework to your own classes.'],
            ]);
        }
    }

    private function ensureOwnHomework($teacher, Homework $homework): void
    {
        if ($homework->teacher_id !== $teacher->id) {
            abort(403, 'Forbidden');
        }
    }
}
