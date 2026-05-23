<?php

namespace App\Services;

use App\Models\Challan;
use App\Models\FeeStructure;
use App\Models\Student;

class ChallanService
{
    public function generateForMonth(string $month, ?int $classId = null): int
    {
        $count = 0;
        $students = Student::with('section.schoolClass')
            ->when($classId, fn ($q) => $q->whereHas('section', fn ($q2) => $q2->where('school_class_id', $classId)))
            ->get();

        foreach ($students as $student) {
            if (Challan::where('student_id', $student->id)->where('month', $month)->exists()) {
                continue;
            }

            $feeStructure = FeeStructure::where(function ($q) use ($student) {
                $q->where('school_class_id', $student->section->school_class_id)
                    ->orWhereNull('school_class_id');
            })->with('items')->first();

            if (! $feeStructure || $feeStructure->items->isEmpty()) {
                continue;
            }

            $items = $feeStructure->items;
            $total = $items->sum('amount');

            Challan::create([
                'student_id' => $student->id,
                'challan_number' => 'CH-'.strtoupper(uniqid()),
                'month' => $month,
                'total_amount' => $total,
                'due_date' => now()->parse($month.'-01')->endOfMonth(),
                'fee_items_snapshot' => $items->toArray(),
            ]);
            $count++;
        }

        return $count;
    }
}
