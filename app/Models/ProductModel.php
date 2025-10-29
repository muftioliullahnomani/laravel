<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'is_active', 'preview_product_id', 'definition'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'definition' => 'array',
    ];

    public function previewProduct()
    {
        return $this->belongsTo(Product::class, 'preview_product_id');
    }
}
