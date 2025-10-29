<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Category;

class Product extends Model
{
    use HasFactory;
    protected $fillable = [
        'category_id', 'product_model_id', 'name', 'slug', 'sku', 'description', 'price', 'stock', 'image_url', 'is_active'
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function productModel()
    {
        return $this->belongsTo(ProductModel::class);
    }
}
