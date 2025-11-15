<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'category', 'price', 'stock', 
        'low_stock_threshold', 'image_path', 
        'description', 'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'low_stock_threshold' => 'integer',
        'is_active' => 'boolean',
    ];

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function isLowStock()
    {
        return $this->stock <= $this->low_stock_threshold;
    }

    public function reduceStock($quantity)
    {
        $this->decrement('stock', $quantity);
    }

    public function increaseStock($quantity)
    {
        $this->increment('stock', $quantity);
    }
}