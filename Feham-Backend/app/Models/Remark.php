<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Remark extends Model
{
    use BelongsToSchool;

    protected $fillable = [
        'school_id', 'teacher_id', 'student_id', 'message', 'is_read',
    ];

    protected function casts(): array
    {
        return ['is_read' => 'boolean'];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
