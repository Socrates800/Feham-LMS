<?php

namespace App\Traits;

trait BelongsToSchool
{
    protected static function bootBelongsToSchool(): void
    {
        static::addGlobalScope('school', function ($query) {
            if (auth()->check() && auth()->user()->school_id) {
                $query->where($query->getModel()->getTable().'.school_id', auth()->user()->school_id);
            }
        });

        static::creating(function ($model) {
            if (auth()->check() && auth()->user()->school_id && ! $model->school_id) {
                $model->school_id = auth()->user()->school_id;
            }
        });
    }
}
