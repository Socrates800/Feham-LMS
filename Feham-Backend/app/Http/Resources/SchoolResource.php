<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchoolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo_path' => $this->logo_path,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'bank_account' => $this->bank_account,
            'bank_name' => $this->bank_name,
            'is_active' => (bool) $this->is_active,
            'plan' => $this->plan,
            'billing_status' => $this->billing_status,
            'subscription_ends_at' => $this->subscription_ends_at,
            'student_limit' => $this->student_limit,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'students_count' => $this->whenCounted('students'),
            'teachers_count' => $this->whenCounted('teachers'),
            'admins_count' => $this->whenCounted('admins'),
            'primary_admin' => $this->whenLoaded('primaryAdmin', function () {
                $admin = $this->primaryAdmin;

                return $admin ? [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                ] : null;
            }),
        ];
    }
}
