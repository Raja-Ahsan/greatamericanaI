<?php

namespace App\Providers;

use App\Services\PaymentConfigService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Merge DB payment_settings into config so arafadev/payment-gateways uses admin-configured keys
        try {
            PaymentConfigService::mergeIntoConfig();
        } catch (\Throwable $e) {
            // Ignore when DB is not ready (e.g. during install/migrate)
        }
    }
}
