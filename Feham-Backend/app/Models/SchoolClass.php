<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use BelongsToSchool;

    protected $table = 'school_classes';

    protected $fillable = ['school_id', 'name', 'grade_level'];

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function feeStructures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }
}
