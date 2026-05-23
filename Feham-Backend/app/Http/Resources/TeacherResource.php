<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_code' => $this->employee_code,
            'subject_specialization' => $this->subject_specialization,
            'phone' => $this->phone,
            'cnic' => $this->cnic,
            'base_salary' => $this->base_salary,
            'joining_date' => $this->joining_date,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'assigned_sections' => $this->whenLoaded('classSections', fn () => $this->classSections->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'school_class' => $s->relationLoaded('schoolClass') && $s->schoolClass ? [
                    'id' => $s->schoolClass->id,
                    'name' => $s->schoolClass->name,
                ] : null,
            ])),
        ];
    }
}
