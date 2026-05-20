<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\PaymentGatewayController;
use App\Http\Controllers\Api\PlatformSettingsController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

// Public routes with rate limiting
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1'); // 5 attempts per minute
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // 5 attempts per minute

// Public agent routes
Route::get('/agents', [AgentController::class, 'index']);
Route::get('/agents/{id}', [AgentController::class, 'show']);

// Public payment gateways list (for checkout; no credentials)
Route::get('/payment-gateways', [PaymentGatewayController::class, 'index']);

// Public platform display settings (seller commission %, platform fee %, name – set by admin)
Route::get('/platform-settings', [PlatformSettingsController::class, 'index']);

// Payment callback (Stripe/PayPal redirect here after payment – no auth)
Route::get('/payment/callback', [CheckoutController::class, 'callback']);

// Protected routes (require authentication) with rate limiting
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () { // 60 requests per minute
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar'])->middleware('throttle:10,1'); // 10 uploads per minute
    Route::post('/profile/change-password', [AuthController::class, 'changePassword'])->middleware('throttle:5,1'); // 5 attempts per minute

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
        Route::get('/by-token', [PurchaseController::class, 'byToken']);
        Route::post('/', [PurchaseController::class, 'store']);
    });

    // Checkout: create payment and get redirect URL to gateway (Stripe, PayPal, etc.)
    Route::post('/checkout/create-payment', [CheckoutController::class, 'createPayment']);

    // Agent management routes (Vendor & Admin) with stricter rate limiting for file uploads
    Route::middleware('role:vendor,admin')->group(function () {
        Route::post('/agents', [AgentController::class, 'store'])->middleware('throttle:10,1'); // 10 uploads per minute
        Route::put('/agents/{id}', [AgentController::class, 'update'])->middleware('throttle:10,1'); // 10 updates per minute
        Route::delete('/agents/{id}', [AgentController::class, 'destroy']);
        Route::get('/my-listings', [AgentController::class, 'myListings']);
    });

    // Agent file download (for customers who purchased)
    Route::get('/agents/{id}/download', [AgentController::class, 'downloadFile']);

    // Dashboard routes (Vendor & Admin)
    Route::middleware('role:vendor,admin')->group(function () {
        Route::get('/dashboard', [PurchaseController::class, 'dashboard']);
        Route::get('/analytics', [PurchaseController::class, 'analytics']);
    });

    // Wallet routes (Vendor & Admin)
    Route::middleware('role:vendor,admin')->prefix('wallet')->group(function () {
        Route::get('/', [WalletController::class, 'index']);
        Route::get('/transactions', [WalletController::class, 'transactions']);
        Route::get('/withdrawals', [WalletController::class, 'withdrawals']);
        Route::post('/withdraw', [WalletController::class, 'withdraw'])->middleware('throttle:5,1'); // 5 requests per minute
    });

    // Vendor settings (Vendor & Admin)
    Route::middleware('role:vendor,admin')->prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
        Route::put('/', [SettingsController::class, 'update']);
    });

    // Admin only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Admin Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminController::class, 'dashboard']);
        Route::get('/analytics', [\App\Http\Controllers\Admin\AdminController::class, 'analytics']);

        // User Management
        Route::apiResource('users', \App\Http\Controllers\Admin\UserController::class);
        
        // Agent Management
        Route::get('/agents', [\App\Http\Controllers\Admin\AgentManagementController::class, 'index']);
        Route::patch('/agents/{id}/status', [\App\Http\Controllers\Admin\AgentManagementController::class, 'updateStatus']);
        Route::delete('/agents/{id}', [\App\Http\Controllers\Admin\AgentManagementController::class, 'destroy']);

        // Wallet & Withdrawals Management
        Route::get('/wallets', [\App\Http\Controllers\Admin\WalletController::class, 'index']);
        Route::get('/wallets/{id}', [\App\Http\Controllers\Admin\WalletController::class, 'show']);
        Route::get('/withdrawals', [\App\Http\Controllers\Admin\WalletController::class, 'withdrawals']);
        Route::patch('/withdrawals/{id}', [\App\Http\Controllers\Admin\WalletController::class, 'updateWithdrawal']);

        // Platform Settings (including Payment Gateways)
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index']);
        Route::put('/settings/platform', [\App\Http\Controllers\Admin\SettingsController::class, 'updatePlatform']);
        Route::put('/settings/payment-settings', [\App\Http\Controllers\Admin\SettingsController::class, 'updatePaymentSettings']);
        Route::post('/settings/gateway-logo', [\App\Http\Controllers\Admin\SettingsController::class, 'uploadGatewayLogo'])->middleware('throttle:60,1');
    });
});
