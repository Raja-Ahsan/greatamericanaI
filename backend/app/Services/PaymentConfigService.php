<?php

namespace App\Services;

use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Config;

/**
 * Merges DB payment_settings (admin panel) into Laravel config so that
 * arafadev/payment-gateways uses credentials and mode from the database.
 */
class PaymentConfigService
{
    /**
     * Map admin credential keys to package config keys per gateway.
     * Keys not listed are passed through as-is (e.g. paypal client_id).
     */
    protected const CREDENTIAL_TO_CONFIG = [
        'stripe' => [
            'test_secret' => 'test_api_key',
            'test_publishable' => 'test_publishable',
            'live_secret' => 'live_api_key',
            'live_publishable' => 'live_publishable',
        ],
        'paypal' => [
            'test_client_id' => 'sandbox_client_id',
            'test_client_secret' => 'sandbox_client_secret',
            'live_client_id' => 'live_client_id',
            'live_client_secret' => 'live_client_secret',
        ],
        'paymob' => [],
        'fawry' => [],
        'tabby' => [],
        'moyasar' => [],
        'myfatoorah' => [],
        'urway' => [
            'test_terminal_id' => 'test_terminal_id',
            'test_password' => 'test_password',
            'live_terminal_id' => 'live_terminal_id',
            'live_password' => 'live_password',
        ],
        'geidea' => [],
        'telr' => [
            'test_store_id' => 'test_store_id',
            'test_auth_key' => 'test_auth_key',
            'live_store_id' => 'live_store_id',
            'live_auth_key' => 'live_auth_key',
        ],
        'tamara' => [],
        'alrajhibank' => [
            'test_transportal_id' => 'test_transportal_id',
            'test_password' => 'test_password',
            'live_transportal_id' => 'live_transportal_id',
            'live_password' => 'live_password',
        ],
        'clickpay' => [
            'test_server_key' => 'test_server_key',
            'live_server_key' => 'live_server_key',
        ],
        'hyperpay' => [
            'test_entity_id' => 'test_entity_id',
            'test_api_key' => 'test_api_key',
            'live_entity_id' => 'live_entity_id',
            'live_api_key' => 'live_api_key',
        ],
        'tap' => [],
    ];

    /**
     * Merge payment_settings from DB into config so the payment package uses them.
     * Call from AppServiceProvider::boot().
     */
    public static function mergeIntoConfig(): void
    {
        $paymentSettings = PlatformSetting::getValue('payment_settings', []);

        if (empty($paymentSettings)) {
            return;
        }

        $enabledGateways = $paymentSettings['enabled_gateways'] ?? [];
        $defaultGateway = $paymentSettings['default_gateway'] ?? 'stripe';
        $gatewaysConfig = $paymentSettings['gateways'] ?? [];

        $baseGateways = config('payments.gateways', []);

        // Restrict gateways to only enabled ones so Payment::available() matches admin choice
        $enabledMap = array_flip($enabledGateways);
        $newGateways = [];
        foreach ($baseGateways as $key => $class) {
            if (isset($enabledMap[$key])) {
                $newGateways[$key] = $class;
            }
        }
        if (!empty($newGateways)) {
            Config::set('payments.gateways', $newGateways);
        }

        Config::set('payments.default_gateway', $defaultGateway);

        foreach ($gatewaysConfig as $gatewayKey => $config) {
            if (!isset($baseGateways[$gatewayKey])) {
                continue;
            }

            $mode = $config['mode'] ?? 'sandbox';
            // PayPal uses "sandbox"; other gateways use "test" for sandbox mode
            if ($gatewayKey === 'paypal' && ($mode === 'test' || $mode === 'sandbox')) {
                $mode = 'sandbox';
            } elseif ($mode === 'sandbox' && $gatewayKey !== 'paypal') {
                $mode = 'test';
            }

            $credentials = $config['credentials'] ?? [];
            $mapping = self::CREDENTIAL_TO_CONFIG[$gatewayKey] ?? [];
            $merged = array_merge(config('payments.' . $gatewayKey, []), [
                'mode' => $mode,
            ]);

            foreach ($credentials as $ourKey => $value) {
                if ((string) $value === '') {
                    continue;
                }
                $configKey = $mapping[$ourKey] ?? $ourKey;
                $merged[$configKey] = $value;
            }

            Config::set('payments.' . $gatewayKey, $merged);
        }
    }
}
