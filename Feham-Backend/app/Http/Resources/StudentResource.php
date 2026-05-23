<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'section_id' => $this->section_id,
            'roll_number' => $this->roll_number,
            'name' => $this->name,
            'guardian_name' => $this->guardian_name,
            'guardian_phone' => $this->guardian_phone,
            'guardian_cnic' => $this->guardian_cnic,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'gender' => $this->gender,
            'address' => $this->address,
            'challans_count' => $this->whenCounted('challans'),
            'parent_user' => $this->whenLoaded('parentUser', fn () => $this->parentUser ? [
                'id' => $this->parentUser->id,
                'name' => $this->parentUser->name,
                'email' => $this->parentUser->email,
            ] : null),
            'section' => $this->whenLoaded('section', fn () => [
                'id' => $this->section->id,
                'name' => $this->section->name,
                'school_class' => $this->section->relationLoaded('schoolClass') ? [
                    'id' => $this->section->schoolClass->id,
                    'name' => $this->section->schoolClass->name,
                ] : null,
            ]),
        ];
    }
}
