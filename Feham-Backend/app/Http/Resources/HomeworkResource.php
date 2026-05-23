<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomeworkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'description' => $this->description,
            'due_date' => $this->due_date,
            'section' => $this->whenLoaded('section', fn () => [
                'id' => $this->section->id,
                'name' => $this->section->name,
                'school_class' => $this->section->relationLoaded('schoolClass') ? [
                    'name' => $this->section->schoolClass->name,
                ] : null,
            ]),
        ];
    }
}
