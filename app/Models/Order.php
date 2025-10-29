<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\OrderItem;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'status', 'payment_method', 'payment_status',
        'subtotal', 'tax', 'shipping', 'total',
        'customer_name', 'customer_email', 'customer_phone',
        'ship_line1', 'ship_line2', 'ship_city', 'ship_state', 'ship_postal_code', 'ship_country',
        'placed_at',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
