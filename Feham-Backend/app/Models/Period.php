<?php

namespace App\Models;

use App\Traits\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;

class Period extends Model
{
    use BelongsToSchool;

    protected $fillable = ['school_id', 'name', 'start_time', 'end_time', 'order_index'];
}
