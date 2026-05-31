<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    use BelongsToSchool;

    protected $fillable = [
        'school_id', 'user_id', 'employee_code', 'subject_specialization',
        'phone', 'cnic', 'base_salary', 'joining_date',
    ];

    protected function casts(): array
    {
        return [
            'base_salary' => 'decimal:2',
            'joining_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class);
    }

    public function classSections(): HasMany
    {
        return $this->hasMany(Section::class, 'class_teacher_id');
    }

    public function homeworks(): HasMany
    {
        return $this->hasMany(Homework::class);
    }

    public function remarks(): HasMany
    {
        return $this->hasMany(Remark::class);
    }

    /** Section IDs this teacher may manage (homeroom + timetable). */
    public function accessibleSectionIds(): array
    {
        $fromTimetable = $this->timetables()->pluck('section_id');
        $fromHomeroom = Section::where('class_teacher_id', $this->id)->pluck('id');

        return $fromTimetable->merge($fromHomeroom)->unique()->filter()->values()->all();
    }
}
