<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use BelongsToSchool;

    protected $fillable = [
        'school_id', 'section_id', 'user_id', 'roll_number', 'name',
        'guardian_name', 'guardian_phone', 'guardian_cnic',
        'date_of_birth', 'gender', 'address',
    ];

    protected function casts(): array
    {
        return ['date_of_birth' => 'date'];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function parentUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function challans(): HasMany
    {
        return $this->hasMany(Challan::class);
    }
}
