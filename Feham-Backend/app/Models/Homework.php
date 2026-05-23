<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Homework extends Model
{
    use BelongsToSchool;

    protected $table = 'homeworks';

    protected $fillable = [
        'school_id', 'teacher_id', 'section_id', 'subject', 'description', 'due_date',
    ];

    protected function casts(): array
    {
        return ['due_date' => 'date'];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
}
