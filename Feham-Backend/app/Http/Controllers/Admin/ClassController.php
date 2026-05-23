<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClassResource;
use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            ClassResource::collection(
                SchoolClass::with(['sections.classTeacher.user', 'sections.students'])
                    ->orderBy('grade_level')
                    ->get()
            )
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'grade_level' => 'required|integer|min:1|max:12',
        ]);

        $class = SchoolClass::create([
            ...$data,
            'school_id' => $request->user()->school_id,
        ]);

        return response()->json(new ClassResource($class), 201);
    }

    public function show(SchoolClass $class): JsonResponse
    {
        return response()->json(new ClassResource($class->load('sections')));
    }

    public function update(Request $request, SchoolClass $class): JsonResponse
    {
        $class->update($request->validate([
            'name' => 'sometimes|string|max:255',
            'grade_level' => 'sometimes|integer|min:1|max:12',
        ]));

        return response()->json(new ClassResource($class));
    }

    public function destroy(SchoolClass $class): JsonResponse
    {
        $class->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
