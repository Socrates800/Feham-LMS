<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PeriodResource;
use App\Models\Period;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            PeriodResource::collection(Period::orderBy('order_index')->get())
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'order_index' => 'required|integer|min:0',
        ]);

        $period = Period::create([...$data, 'school_id' => $request->user()->school_id]);

        return response()->json(new PeriodResource($period), 201);
    }

    public function show(Period $period): JsonResponse
    {
        return response()->json(new PeriodResource($period));
    }

    public function update(Request $request, Period $period): JsonResponse
    {
        $period->update($request->validate([
            'name' => 'sometimes|string',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'order_index' => 'sometimes|integer|min:0',
        ]));

        return response()->json(new PeriodResource($period));
    }

    public function destroy(Period $period): JsonResponse
    {
        $period->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
