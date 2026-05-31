<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalarySlip;
use App\Services\PdfService;
use App\Services\SalaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalaryController extends Controller
{
    public function __construct(
        private SalaryService $salaryService,
        private PdfService $pdfService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = SalarySlip::with('teacher.user');
        if ($request->month) {
            $query->where('month', $request->month);
        }
        if ($request->teacher_id) {
            $query->where('teacher_id', $request->teacher_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'teacher_id' => 'nullable|exists:teachers,id',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'status' => ['nullable', Rule::in(['draft', 'issued'])],
        ]);

        $count = $this->salaryService->generateForMonth(
            $data['month'],
            $data['teacher_id'] ?? null,
            (float) ($data['allowances'] ?? 0),
            (float) ($data['deductions'] ?? 0),
            $data['status'] ?? 'issued',
        );

        return response()->json(['message' => "Generated {$count} salary slips"]);
    }

    public function update(Request $request, SalarySlip $salarySlip): JsonResponse
    {
        $data = $request->validate([
            'allowances' => 'required|numeric|min:0',
            'manual_deductions' => 'required|numeric|min:0',
            'status' => ['required', Rule::in(['draft', 'issued'])],
            'payroll_note' => 'nullable|string|max:1000',
        ]);

        $salarySlip = $this->salaryService->updateSlip(
            $salarySlip,
            (float) $data['allowances'],
            (float) $data['manual_deductions'],
            $data['status'],
            $data['payroll_note'] ?? null,
        );

        return response()->json($salarySlip);
    }

    public function downloadPdf(SalarySlip $salarySlip)
    {
        $salarySlip->load('teacher.user');
        $school = auth()->user()->school;

        return $this->pdfService->salarySlip(['slip' => $salarySlip, 'school' => $school]);
    }
}
