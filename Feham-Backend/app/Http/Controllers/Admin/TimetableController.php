<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Timetable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Timetable::with(['section.schoolClass', 'teacher.user', 'period']);
        if ($request->section_id) {
            $query->where('section_id', $request->section_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'teacher_id' => 'required|exists:teachers,id',
            'period_id' => 'required|exists:periods,id',
            'subject' => 'required|string|max:255',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
        ]);

        $entry = Timetable::updateOrCreate(
            [
                'section_id' => $data['section_id'],
                'period_id' => $data['period_id'],
                'day' => $data['day'],
            ],
            [...$data, 'school_id' => $request->user()->school_id]
        );

        return response()->json($entry->load(['section.schoolClass', 'teacher.user', 'period']), 201);
    }

    public function show(Timetable $timetable): JsonResponse
    {
        return response()->json($timetable->load(['section.schoolClass', 'teacher.user', 'period']));
    }

    public function update(Request $request, Timetable $timetable): JsonResponse
    {
        $timetable->update($request->validate([
            'teacher_id' => 'sometimes|exists:teachers,id',
            'subject' => 'sometimes|string|max:255',
        ]));

        return response()->json($timetable->load(['section.schoolClass', 'teacher.user', 'period']));
    }

    public function destroy(Timetable $timetable): JsonResponse
    {
        $timetable->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
