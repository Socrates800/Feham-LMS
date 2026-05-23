<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeeItem;
use App\Models\FeeStructure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            FeeStructure::with(['items', 'schoolClass'])->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'school_class_id' => 'nullable|exists:school_classes,id',
            'items' => 'required|array|min:1',
            'items.*.label' => 'required|string',
            'items.*.amount' => 'required|numeric|min:0',
            'items.*.is_optional' => 'boolean',
        ]);

        $structure = DB::transaction(function () use ($data, $request) {
            $structure = FeeStructure::create([
                'school_id' => $request->user()->school_id,
                'name' => $data['name'],
                'school_class_id' => $data['school_class_id'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                FeeItem::create([
                    'fee_structure_id' => $structure->id,
                    'label' => $item['label'],
                    'amount' => $item['amount'],
                    'is_optional' => $item['is_optional'] ?? false,
                ]);
            }

            return $structure->load(['items', 'schoolClass']);
        });

        return response()->json($structure, 201);
    }

    public function show(FeeStructure $feeStructure): JsonResponse
    {
        return response()->json($feeStructure->load(['items', 'schoolClass']));
    }

    public function update(Request $request, FeeStructure $feeStructure): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'school_class_id' => 'nullable|exists:school_classes,id',
            'items' => 'sometimes|array|min:1',
            'items.*.label' => 'required_with:items|string',
            'items.*.amount' => 'required_with:items|numeric|min:0',
            'items.*.is_optional' => 'boolean',
        ]);

        DB::transaction(function () use ($data, $feeStructure) {
            $feeStructure->update([
                'name' => $data['name'] ?? $feeStructure->name,
                'school_class_id' => array_key_exists('school_class_id', $data)
                    ? $data['school_class_id']
                    : $feeStructure->school_class_id,
            ]);

            if (array_key_exists('items', $data)) {
                $feeStructure->items()->delete();
                foreach ($data['items'] as $item) {
                    FeeItem::create([
                        'fee_structure_id' => $feeStructure->id,
                        'label' => $item['label'],
                        'amount' => $item['amount'],
                        'is_optional' => $item['is_optional'] ?? false,
                    ]);
                }
            }
        });

        return response()->json($feeStructure->fresh()->load(['items', 'schoolClass']));
    }

    public function destroy(FeeStructure $feeStructure): JsonResponse
    {
        $feeStructure->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
