<?php

use Illuminate\Support\Facades\Route;

// Serve React app for all web routes (SPA fallback)
// This allows React Router to handle client-side routing
Route::get('/{any?}', function () {
    $reactIndexPath = public_path('index.html');
    
    if (file_exists($reactIndexPath)) {
        return response()->file($reactIndexPath);
    }
    
    // Fallback to Laravel welcome if React app not built yet
    return view('welcome');
})->where('any', '^(?!api).*$'); // Exclude /api routes
