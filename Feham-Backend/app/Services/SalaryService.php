<?php

namespace App\Services;

use App\Models\SalarySlip;
use App\Models\Teacher;

class SalaryService
{
    public function generateForMonth(
        string $month,
        ?int $teacherId = null,
        float $allowances = 0,
        float $deductions = 0
    ): int
    {
        $count = 0;
        $teachers = Teacher::when($teacherId, fn ($q) => $q->where('id', $teacherId))->get();

        foreach ($teachers as $teacher) {
            if (SalarySlip::where('teacher_id', $teacher->id)->where('month', $month)->exists()) {
                continue;
            }

            $base = (float) $teacher->base_salary;
            $net = $base + $allowances - $deductions;

            SalarySlip::create([
                'teacher_id' => $teacher->id,
                'month' => $month,
                'base_salary' => $base,
                'allowances' => $allowances,
                'deductions' => $deductions,
                'net_salary' => $net,
                'status' => 'issued',
                'breakdown' => [
                    'base' => $base,
                    'allowances' => $allowances,
                    'deductions' => $deductions,
                ],
            ]);
            $count++;
        }

        return $count;
    }
}
