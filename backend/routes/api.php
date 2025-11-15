<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;

// Public routes (NO authentication needed)
Route::post('/login', [AuthController::class, 'login']);
Route::get('/receipt/{receiptNumber}', [SaleController::class, 'receipt']);

// Products - Allow viewing without auth
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/categories', [ProductController::class, 'categories']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Sales
    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store']);
    Route::get('/sales/{sale}', [SaleController::class, 'show']);

    // Dashboard
    Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        // Products Management (write operations)
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::post('/products/{product}', [ProductController::class, 'update']); // For FormData
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        
        // Users Management
        Route::apiResource('users', UserController::class);
    });
});