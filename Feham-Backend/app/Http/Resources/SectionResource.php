<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'school_class_id' => $this->school_class_id,
            'class_teacher_id' => $this->class_teacher_id,
            'school_class' => $this->whenLoaded('schoolClass', fn () => [
                'id' => $this->schoolClass->id,
                'name' => $this->schoolClass->name,
            ]),
            'class_teacher' => $this->whenLoaded('classTeacher', function () {
                if (! $this->classTeacher) {
                    return null;
                }

                return [
                    'id' => $this->classTeacher->id,
                    'user' => $this->classTeacher->relationLoaded('user') ? [
                        'name' => $this->classTeacher->user->name,
                    ] : null,
                ];
            }),
            'students_count' => $this->when(isset($this->students_count), $this->students_count)
                ?? ($this->relationLoaded('students') ? $this->students->count() : null),
            'students' => $this->whenLoaded('students', fn () => $this->students->map(fn ($s) => [
                'id' => $s->id,
                'roll_number' => $s->roll_number,
                'name' => $s->name,
                'guardian_name' => $s->guardian_name,
                'guardian_phone' => $s->guardian_phone,
            ])),
        ];
    }
}
