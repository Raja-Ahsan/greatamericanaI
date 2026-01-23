<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\PurchaseController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public agent routes
Route::get('/agents', [AgentController::class, 'index']);
Route::get('/agents/{id}', [AgentController::class, 'show']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
    Route::post('/profile/change-password', [AuthController::class, 'changePassword']);

    // Cart routes (Customer)
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/', [CartController::class, 'store']);
        Route::put('/{id}', [CartController::class, 'update']);
        Route::delete('/{id}', [CartController::class, 'destroy']);
        Route::delete('/', [CartController::class, 'clear']);
    });

    // Purchase routes (Customer)
    Route::prefix('purchases')->group(function () {
        Route::get('/', [PurchaseController::class, 'index']);
        Route::post('/', [PurchaseController::class, 'store']);
    });

    // Agent management routes (Vendor & Admin)
    Route::middleware('role:vendor,admin')->group(function () {
        Route::post('/agents', [AgentController::class, 'store']);
        Route::put('/agents/{id}', [AgentController::class, 'update']);
        Route::delete('/agents/{id}', [AgentController::class, 'destroy']);
        Route::get('/my-listings', [AgentController::class, 'myListings']);
    });

    // Agent file download (for customers who purchased)
    Route::get('/agents/{id}/download', [AgentController::class, 'downloadFile']);

    // Dashboard routes (Vendor & Admin)
    Route::middleware('role:vendor,admin')->group(function () {
        Route::get('/dashboard', [PurchaseController::class, 'dashboard']);
    });

    // Admin only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Admin Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminController::class, 'dashboard']);
        
        // User Management
        Route::apiResource('users', \App\Http\Controllers\Admin\UserController::class);
        
        // Agent Management
        Route::get('/agents', [\App\Http\Controllers\Admin\AgentManagementController::class, 'index']);
        Route::patch('/agents/{id}/status', [\App\Http\Controllers\Admin\AgentManagementController::class, 'updateStatus']);
        Route::delete('/agents/{id}', [\App\Http\Controllers\Admin\AgentManagementController::class, 'destroy']);
    });
});
