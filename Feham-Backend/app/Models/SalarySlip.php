<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalarySlip extends Model
{
    use BelongsToSchool;

    protected $fillable = [
        'school_id', 'teacher_id', 'month', 'base_salary', 'allowances',
        'deductions', 'net_salary', 'status', 'breakdown',
    ];

    protected function casts(): array
    {
        return [
            'base_salary' => 'decimal:2',
            'allowances' => 'decimal:2',
            'deductions' => 'decimal:2',
            'net_salary' => 'decimal:2',
            'breakdown' => 'array',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}
