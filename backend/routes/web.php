<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReceiptController;

// Add this route
Route::get('/receipt/{receiptNumber}', [ReceiptController::class, 'show'])->name('receipt.show');

// Your other routes...
