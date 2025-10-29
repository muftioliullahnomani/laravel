<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomepageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'is_active', 'position'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'homepage_section_category', 'section_id', 'category_id')
            ->withPivot(['product_limit'])
            ->withTimestamps()
            ->orderBy('homepage_section_category.id');
    }

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function scopeOrdered($q)
    {
        return $q->orderBy('position')->orderBy('id');
    }
}
