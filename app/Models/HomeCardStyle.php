<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomeCardStyle extends Model
{
    use HasFactory;

    protected $fillable = [
        'style',
    ];

    protected $casts = [
        'style' => 'array',
    ];
}
