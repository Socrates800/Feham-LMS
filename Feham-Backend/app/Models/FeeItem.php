<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeItem extends Model
{
    protected $fillable = ['fee_structure_id', 'label', 'amount', 'is_optional'];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_optional' => 'boolean',
        ];
    }

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }
}
