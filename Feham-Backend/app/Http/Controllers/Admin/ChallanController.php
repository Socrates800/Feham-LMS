<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChallanResource;
use App\Models\Challan;
use App\Services\ChallanService;
use App\Services\PdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChallanController extends Controller
{
    public function __construct(
        private ChallanService $challanService,
        private PdfService $pdfService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Challan::with(['student.section.schoolClass']);

        if ($request->month) {
            $query->where('month', $request->month);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->school_class_id) {
            $query->whereHas('student.section', fn ($q) => $q->where('school_class_id', $request->school_class_id));
        }

        return response()->json(ChallanResource::collection($query->latest()->get()));
    }

    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'school_class_id' => 'nullable|exists:school_classes,id',
        ]);

        $count = $this->challanService->generateForMonth($data['month'], $data['school_class_id'] ?? null);

        return response()->json(['message' => "Generated {$count} challans"]);
    }

    public function downloadPdf(Challan $challan)
    {
        $challan->load(['student.section.schoolClass']);
        $school = auth()->user()->school;

        return $this->pdfService->challan(compact('challan', 'school'));
    }

    public function markPaid(Request $request, Challan $challan): JsonResponse
    {
        $data = $request->validate([
            'payment_method' => 'nullable|string|in:online,bank,cash',
        ]);

        $challan->update([
            'status' => 'paid',
            'paid_date' => now(),
            'payment_method' => $data['payment_method'] ?? 'bank',
        ]);

        return response()->json(new ChallanResource($challan->load('student.section.schoolClass')));
    }
}
