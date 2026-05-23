<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Challan extends Model
{
    use BelongsToSchool;

    protected $fillable = [
        'school_id', 'student_id', 'challan_number', 'month', 'total_amount',
        'status', 'due_date', 'paid_date', 'payment_method', 'fee_items_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'due_date' => 'date',
            'paid_date' => 'date',
            'fee_items_snapshot' => 'array',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
