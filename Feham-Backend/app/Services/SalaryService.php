<?php

namespace App\Services;

use App\Models\SalarySlip;
use App\Models\Teacher;
use App\Models\TeacherLeaveRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\CarbonPeriod;

class SalaryService
{
    public function generateForMonth(
        string $month,
        ?int $teacherId = null,
        float $allowances = 0,
        float $deductions = 0,
        string $status = 'issued'
    ): int
    {
        $count = 0;
        $teachers = Teacher::when($teacherId, fn ($q) => $q->where('id', $teacherId))->get();

        foreach ($teachers as $teacher) {
            if (SalarySlip::where('teacher_id', $teacher->id)->where('month', $month)->exists()) {
                continue;
            }

            $base = (float) $teacher->base_salary;
            $unpaidLeave = $this->unpaidLeaveDeduction($teacher, $month);
            $totalDeductions = $deductions + $unpaidLeave['amount'];
            $net = $base + $allowances - $totalDeductions;

            SalarySlip::create([
                'teacher_id' => $teacher->id,
                'month' => $month,
                'base_salary' => $base,
                'allowances' => $allowances,
                'deductions' => $totalDeductions,
                'net_salary' => $net,
                'status' => $status,
                'breakdown' => [
                    'base' => $base,
                    'allowances' => $allowances,
                    'manual_deductions' => $deductions,
                    'unpaid_leave_days' => $unpaidLeave['days'],
                    'unpaid_leave_deduction' => $unpaidLeave['amount'],
                    'per_day_salary' => $unpaidLeave['per_day_salary'],
                    'deductions' => $totalDeductions,
                ],
            ]);
            $count++;
        }

        return $count;
    }

    public function updateSlip(
        SalarySlip $slip,
        float $allowances,
        float $manualDeductions,
        string $status,
        ?string $payrollNote = null
    ): SalarySlip {
        $slip->loadMissing('teacher');
        $unpaidLeave = $this->unpaidLeaveDeduction($slip->teacher, $slip->month);
        $totalDeductions = $manualDeductions + $unpaidLeave['amount'];
        $net = (float) $slip->base_salary + $allowances - $totalDeductions;

        $slip->update([
            'allowances' => $allowances,
            'deductions' => $totalDeductions,
            'net_salary' => $net,
            'status' => $status,
            'breakdown' => array_merge($slip->breakdown ?? [], [
                'base' => (float) $slip->base_salary,
                'allowances' => $allowances,
                'manual_deductions' => $manualDeductions,
                'unpaid_leave_days' => $unpaidLeave['days'],
                'unpaid_leave_deduction' => $unpaidLeave['amount'],
                'per_day_salary' => $unpaidLeave['per_day_salary'],
                'deductions' => $totalDeductions,
                'payroll_note' => $payrollNote,
            ]),
        ]);

        return $slip->fresh(['teacher.user']);
    }

    public function syncUnpaidLeaveDeductions(int $teacherId, string $startDate, string $endDate): void
    {
        $start = Carbon::parse($startDate)->startOfMonth();
        $end = Carbon::parse($endDate)->startOfMonth();

        while ($start->lessThanOrEqualTo($end)) {
            $month = $start->format('Y-m');
            $slip = SalarySlip::with('teacher')
                ->where('teacher_id', $teacherId)
                ->where('month', $month)
                ->first();

            if ($slip && $slip->teacher) {
                $this->syncSalarySlipUnpaidLeave($slip);
            }

            $start->addMonth();
        }
    }

    private function syncSalarySlipUnpaidLeave(SalarySlip $slip): void
    {
        $breakdown = $slip->breakdown ?? [];
        $previousUnpaidDeduction = (float) ($breakdown['unpaid_leave_deduction'] ?? 0);
        $manualDeductions = array_key_exists('manual_deductions', $breakdown)
            ? (float) $breakdown['manual_deductions']
            : max(0, (float) $slip->deductions - $previousUnpaidDeduction);
        $unpaidLeave = $this->unpaidLeaveDeduction($slip->teacher, $slip->month);
        $totalDeductions = $manualDeductions + $unpaidLeave['amount'];
        $net = (float) $slip->base_salary + (float) $slip->allowances - $totalDeductions;

        $slip->update([
            'deductions' => $totalDeductions,
            'net_salary' => $net,
            'breakdown' => array_merge($breakdown, [
                'base' => (float) $slip->base_salary,
                'allowances' => (float) $slip->allowances,
                'manual_deductions' => $manualDeductions,
                'unpaid_leave_days' => $unpaidLeave['days'],
                'unpaid_leave_deduction' => $unpaidLeave['amount'],
                'per_day_salary' => $unpaidLeave['per_day_salary'],
                'deductions' => $totalDeductions,
            ]),
        ]);
    }

    private function unpaidLeaveDeduction(Teacher $teacher, string $month): array
    {
        $monthStart = Carbon::parse($month.'-01')->startOfDay();
        $monthEnd = $monthStart->copy()->endOfMonth()->startOfDay();
        $dates = [];

        $requests = TeacherLeaveRequest::where('teacher_id', $teacher->id)
            ->where('leave_type', 'unpaid')
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $monthEnd)
            ->whereDate('end_date', '>=', $monthStart)
            ->get();

        foreach ($requests as $request) {
            $start = Carbon::parse($request->start_date)->max($monthStart);
            $end = Carbon::parse($request->end_date)->min($monthEnd);

            foreach (CarbonPeriod::create($start, $end) as $date) {
                $dates[$date->format('Y-m-d')] = true;
            }
        }

        $days = count($dates);
        $perDaySalary = round((float) $teacher->base_salary / $monthStart->daysInMonth, 2);

        return [
            'days' => $days,
            'per_day_salary' => $perDaySalary,
            'amount' => round($days * $perDaySalary, 2),
        ];
    }
}
