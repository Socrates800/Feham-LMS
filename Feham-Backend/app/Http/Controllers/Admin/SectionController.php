<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SectionResource;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Section::with(['schoolClass', 'classTeacher.user', 'students']);
        if ($request->school_class_id) {
            $query->where('school_class_id', $request->school_class_id);
        }

        return response()->json(SectionResource::collection($query->get()));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'name' => 'required|string|max:10',
            'class_teacher_id' => 'nullable|exists:teachers,id',
        ]);

        $section = Section::create([
            ...$data,
            'school_id' => $request->user()->school_id,
        ]);

        return response()->json(
            new SectionResource($section->load(['schoolClass', 'classTeacher.user', 'students'])),
            201
        );
    }

    public function show(Section $section): JsonResponse
    {
        return response()->json(new SectionResource($section->load(['schoolClass', 'classTeacher.user', 'students'])));
    }

    public function update(Request $request, Section $section): JsonResponse
    {
        $section->update($request->validate([
            'name' => 'sometimes|string|max:10',
            'class_teacher_id' => 'nullable|exists:teachers,id',
        ]));

        return response()->json(
            new SectionResource($section->load(['schoolClass', 'classTeacher.user', 'students']))
        );
    }

    public function destroy(Section $section): JsonResponse
    {
        $section->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
