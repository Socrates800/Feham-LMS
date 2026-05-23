<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChallanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'challan_number' => $this->challan_number,
            'month' => $this->month,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'due_date' => $this->due_date,
            'paid_date' => $this->paid_date,
            'payment_method' => $this->payment_method,
            'fee_items_snapshot' => $this->fee_items_snapshot,
            'student' => new StudentResource($this->whenLoaded('student')),
        ];
    }
}
