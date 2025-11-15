<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'user_id', 'receipt_number', 'subtotal', 
        'tax', 'discount', 'total_amount', 
        'payment_type', 'payment_received', 
        'change_amount', 'qr_code_path', 'receipt_url'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'payment_received' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public static function generateReceiptNumber()
    {
        return 'RCP-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }
}