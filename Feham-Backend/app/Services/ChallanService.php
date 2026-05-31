<?php

namespace App\Services;

use App\Models\Challan;
use App\Models\FeeStructure;
use App\Models\Student;

class ChallanService
{
    private const LATE_ATTENDANCE_FINE_AMOUNT = 20;

    public function generateForMonth(string $month, ?int $classId = null): int
    {
        $count = 0;
        $students = Student::with('section.schoolClass')
            ->when($classId, fn ($q) => $q->whereHas('section', fn ($q2) => $q2->where('school_class_id', $classId)))
            ->get();

        foreach ($students as $student) {
            $feeStructure = FeeStructure::where(function ($q) use ($student) {
                $q->where('school_class_id', $student->section->school_class_id)
                    ->orWhereNull('school_class_id');
            })->with('items')->first();

            if (! $feeStructure || $feeStructure->items->isEmpty()) {
                continue;
            }

            $items = $feeStructure->items;
            $existingChallan = Challan::where('student_id', $student->id)
                ->where('month', $month)
                ->latest()
                ->first();

            if ($existingChallan) {
                $existingItems = collect($existingChallan->fee_items_snapshot ?? []);
                $hasRegularFees = $existingItems->contains(
                    fn ($item) => ! str_starts_with((string) ($item['key'] ?? ''), 'late-attendance:')
                );

                if ($hasRegularFees || $existingChallan->status !== 'pending') {
                    continue;
                }

                $mergedItems = collect($items->toArray())->merge($existingItems)->values();
                $existingChallan->update([
                    'fee_items_snapshot' => $mergedItems->all(),
                    'total_amount' => $mergedItems->sum(fn ($item) => (float) ($item['amount'] ?? 0)),
                ]);
                $count++;

                continue;
            }

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

    public function syncLateAttendanceFine(Student $student, string $date, bool $isLate): void
    {
        $month = now()->parse($date)->format('Y-m');
        $fineKey = "late-attendance:{$date}";

        $challan = Challan::where('student_id', $student->id)
            ->where('month', $month)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if (! $challan && $isLate) {
            $challan = Challan::create([
                'school_id' => $student->school_id,
                'student_id' => $student->id,
                'challan_number' => 'CH-'.strtoupper(uniqid()),
                'month' => $month,
                'total_amount' => 0,
                'due_date' => now()->parse($month.'-01')->endOfMonth(),
                'fee_items_snapshot' => [],
            ]);
        }

        if (! $challan) {
            return;
        }

        $items = collect($challan->fee_items_snapshot ?? [])
            ->reject(fn ($item) => ($item['key'] ?? null) === $fineKey)
            ->values();

        if ($isLate) {
            $items->push([
                'key' => $fineKey,
                'label' => 'Late attendance fine ('.$date.')',
                'amount' => self::LATE_ATTENDANCE_FINE_AMOUNT,
                'is_optional' => false,
            ]);
        }

        $challan->update([
            'fee_items_snapshot' => $items->all(),
            'total_amount' => $items->sum(fn ($item) => (float) ($item['amount'] ?? 0)),
        ]);
    }
}
