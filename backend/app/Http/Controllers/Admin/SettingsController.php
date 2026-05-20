<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * All payment gateways supported by arafadev/payment-gateways (Laravel 12).
     * Used when config/payments.gateways is not published yet.
     */
    protected const PAYMENT_GATEWAYS = [
        'stripe' => ['name' => 'Stripe', 'region' => 'Global'],
        'paypal' => ['name' => 'PayPal', 'region' => 'Global'],
        'paymob' => ['name' => 'Paymob', 'region' => 'MENA'],
        'fawry' => ['name' => 'Fawry', 'region' => 'Egypt'],
        'tabby' => ['name' => 'Tabby', 'region' => 'MENA'],
        'moyasar' => ['name' => 'Moyasar', 'region' => 'MENA'],
        'myfatoorah' => ['name' => 'MyFatoorah', 'region' => 'Middle East'],
        'urway' => ['name' => 'Urway', 'region' => 'MENA'],
        'geidea' => ['name' => 'Geidea', 'region' => 'MENA'],
        'telr' => ['name' => 'Telr', 'region' => 'Middle East'],
        'tamara' => ['name' => 'Tamara', 'region' => 'MENA'],
        'alrajhibank' => ['name' => 'Al Rajhi Bank', 'region' => 'Saudi Arabia'],
        'clickpay' => ['name' => 'ClickPay', 'region' => 'MENA'],
        'hyperpay' => ['name' => 'HyperPay', 'region' => 'MENA'],
        'tap' => ['name' => 'Tap', 'region' => 'MENA'],
    ];

    /**
     * Credential fields per gateway (test + live) for admin UI.
     */
    protected const CREDENTIAL_FIELDS = [
        'stripe' => [
            ['key' => 'test_secret', 'label' => 'Test Secret Key (sk_test_...)', 'type' => 'password'],
            ['key' => 'test_publishable', 'label' => 'Test Publishable Key (pk_test_...)', 'type' => 'text'],
            ['key' => 'live_secret', 'label' => 'Live Secret Key (sk_live_...)', 'type' => 'password'],
            ['key' => 'live_publishable', 'label' => 'Live Publishable Key (pk_live_...)', 'type' => 'text'],
        ],
        'paypal' => [
            ['key' => 'test_client_id', 'label' => 'Test Client ID', 'type' => 'text'],
            ['key' => 'test_client_secret', 'label' => 'Test Client Secret', 'type' => 'password'],
            ['key' => 'live_client_id', 'label' => 'Live Client ID', 'type' => 'text'],
            ['key' => 'live_client_secret', 'label' => 'Live Client Secret', 'type' => 'password'],
        ],
        'paymob' => [
            ['key' => 'test_api_key', 'label' => 'Test API Key', 'type' => 'password'],
            ['key' => 'live_api_key', 'label' => 'Live API Key', 'type' => 'password'],
        ],
        'fawry' => [
            ['key' => 'test_merchant_code', 'label' => 'Test Merchant Code', 'type' => 'text'],
            ['key' => 'test_security_key', 'label' => 'Test Security Key', 'type' => 'password'],
            ['key' => 'live_merchant_code', 'label' => 'Live Merchant Code', 'type' => 'text'],
            ['key' => 'live_security_key', 'label' => 'Live Security Key', 'type' => 'password'],
        ],
        'tabby' => [
            ['key' => 'test_api_key', 'label' => 'Test API Key', 'type' => 'password'],
            ['key' => 'live_api_key', 'label' => 'Live API Key', 'type' => 'password'],
        ],
        'moyasar' => [
            ['key' => 'test_api_key', 'label' => 'Test API Key', 'type' => 'password'],
            ['key' => 'live_api_key', 'label' => 'Live API Key', 'type' => 'password'],
        ],
        'myfatoorah' => [
            ['key' => 'test_api_key', 'label' => 'Test API Key', 'type' => 'password'],
            ['key' => 'live_api_key', 'label' => 'Live API Key', 'type' => 'password'],
        ],
        'urway' => [
            ['key' => 'test_terminal_id', 'label' => 'Test Terminal ID', 'type' => 'text'],
            ['key' => 'test_password', 'label' => 'Test Password', 'type' => 'password'],
            ['key' => 'live_terminal_id', 'label' => 'Live Terminal ID', 'type' => 'text'],
            ['key' => 'live_password', 'label' => 'Live Password', 'type' => 'password'],
        ],
        'geidea' => [
            ['key' => 'test_api_key', 'label' => 'Test API Key', 'type' => 'password'],
            ['key' => 'live_api_key', 'label' => 'Live API Key', 'type' => 'password'],
        ],
        'telr' => [
            ['key' => 'test_store_id', 'label' => 'Test Store ID', 'type' => 'text'],
            ['key' => 'test_auth_key', 'label' => 'Test Auth Key', 'type' => 'password'],
            ['key' => 'live_store_id', 'label' => 'Live Store ID', 'type' => 'text'],
            ['key' => 'live_auth_key', 'label' => 'Live Auth Key', 'type' => 'password'],
        ],
        'tamara' => [
            ['key' => 'test_api_key', 'label' => 'Test API Key', 'type' => 'password'],
            ['key' => 'live_api_key', 'label' => 'Live API Key', 'type' => 'password'],
        ],
        'alrajhibank' => [
            ['key' => 'test_transportal_id', 'label' => 'Test Transportal ID', 'type' => 'text'],
            ['key' => 'test_password', 'label' => 'Test Password', 'type' => 'password'],
            ['key' => 'live_transportal_id', 'label' => 'Live Transportal ID', 'type' => 'text'],
            ['key' => 'live_password', 'label' => 'Live Password', 'type' => 'password'],
        ],
        'clickpay' => [
            ['key' => 'test_server_key', 'label' => 'Test Server Key', 'type' => 'password'],
            ['key' => 'live_server_key', 'label' => 'Live Server Key', 'type' => 'password'],
        ],
        'hyperpay' => [
            ['key' => 'test_entity_id', 'label' => 'Test Entity ID', 'type' => 'text'],
            ['key' => 'test_api_key', 'label' => 'Test API Key', 'type' => 'password'],
            ['key' => 'live_entity_id', 'label' => 'Live Entity ID', 'type' => 'text'],
            ['key' => 'live_api_key', 'label' => 'Live API Key', 'type' => 'password'],
        ],
        'tap' => [
            ['key' => 'test_api_key', 'label' => 'Test API Key', 'type' => 'password'],
            ['key' => 'live_api_key', 'label' => 'Live API Key', 'type' => 'password'],
        ],
    ];

    /**
     * Get available gateways for admin UI. Always returns at least PAYMENT_GATEWAYS
     * so admin always sees all sections; merges in any extra keys from package config.
     */
    protected static function getAvailableGateways(): array
    {
        $keys = array_keys(self::PAYMENT_GATEWAYS);
        if (config()->has('payments.gateways')) {
            $fromConfig = array_keys(config('payments.gateways', []));
            $keys = array_values(array_unique(array_merge($keys, $fromConfig)));
        }
        $result = [];
        foreach ($keys as $key) {
            $result[$key] = self::PAYMENT_GATEWAYS[$key] ?? ['name' => ucfirst($key), 'region' => '—'];
        }
        return $result;
    }

    /**
     * Get all platform settings (platform + payment settings).
     */
    public function index(Request $request)
    {
        $platform = PlatformSetting::getValue('platform', [
            'platformName' => 'GreatAmerican.Ai',
            'platformFee' => 15,
            'sellerCommission' => 85,
            'taxRate' => 10,
            'maintenanceMode' => false,
        ]);

        $paymentSettings = PlatformSetting::getValue('payment_settings', []);
        if (empty($paymentSettings)) {
            $legacyGateways = PlatformSetting::getValue('payment_gateways', []);
            $legacyCreds = PlatformSetting::getValue('payment_credentials', []);
            $defaultGateway = $legacyGateways['default_gateway'] ?? 'stripe';
            $enabledGateways = $legacyGateways['enabled_gateways'] ?? ['stripe', 'paypal'];
            $gatewaysConfig = [];
            foreach (array_keys(self::getAvailableGateways()) as $key) {
                $gatewaysConfig[$key] = [
                    'mode' => $key === 'paypal' ? 'sandbox' : 'test',
                    'logo_url' => '',
                    'credentials' => $legacyCreds[$key] ?? [],
                ];
            }
            $paymentSettings = ['default_gateway' => $defaultGateway, 'enabled_gateways' => $enabledGateways, 'gateways' => $gatewaysConfig];
        }
        $defaultGateway = $paymentSettings['default_gateway'] ?? 'stripe';
        $enabledGateways = $paymentSettings['enabled_gateways'] ?? ['stripe', 'paypal'];
        $gatewaysConfig = $paymentSettings['gateways'] ?? [];

        $availableGateways = self::getAvailableGateways();
        // Ensure every available gateway has an entry so frontend doesn't drop them on save
        foreach (array_keys($availableGateways) as $key) {
            if (!isset($gatewaysConfig[$key])) {
                $gatewaysConfig[$key] = [
                    'mode' => $key === 'paypal' ? 'sandbox' : 'test',
                    'logo_url' => '',
                    'credentials' => [],
                ];
            }
        }
        $credentialFields = self::CREDENTIAL_FIELDS;

        return response()->json([
            'success' => true,
            'data' => [
                'platform' => $platform,
                'payment_settings' => [
                    'default_gateway' => $defaultGateway,
                    'enabled_gateways' => $enabledGateways,
                    'gateways' => $gatewaysConfig,
                    'available_gateways' => $availableGateways,
                    'credential_fields' => $credentialFields,
                ],
            ],
        ]);
    }

    /**
     * Update platform settings (platform name, fee, etc.).
     */
    public function updatePlatform(Request $request)
    {
        $request->validate([
            'platformName' => 'nullable|string|max:255',
            'platformFee' => 'nullable|numeric|min:0|max:100',
            'sellerCommission' => 'nullable|numeric|min:0|max:100',
            'taxRate' => 'nullable|numeric|min:0|max:100',
            'maintenanceMode' => 'nullable|boolean',
        ]);

        $current = PlatformSetting::getValue('platform', []);
        $updated = array_merge($current, $request->only([
            'platformName', 'platformFee', 'sellerCommission', 'taxRate', 'maintenanceMode',
        ]));
        $updated = array_filter($updated, fn ($v) => $v !== null);

        PlatformSetting::setValue('platform', $updated);

        return response()->json([
            'success' => true,
            'message' => 'Platform settings saved successfully.',
            'data' => PlatformSetting::getValue('platform'),
        ]);
    }

    /**
     * Update all payment gateway settings (default, enabled, per-gateway mode/logo/credentials).
     * All stored in platform_settings.payment_settings in DB.
     */
    public function updatePaymentSettings(Request $request)
    {
        try {
            $availableKeys = array_keys(self::getAvailableGateways());
            if (empty($availableKeys)) {
                $availableKeys = array_keys(self::PAYMENT_GATEWAYS);
            }
            $allowedGateways = implode(',', $availableKeys);

            $request->validate([
                'default_gateway' => 'required|string|in:' . $allowedGateways,
                'enabled_gateways' => 'required|array',
                'enabled_gateways.*' => 'string|in:' . $allowedGateways,
                'gateways' => 'nullable|array',
            ]);

            $enabled = array_values(array_unique(array_filter($request->enabled_gateways ?? [])));
            $defaultGateway = (string) $request->default_gateway;
            if (! in_array($defaultGateway, $enabled, true)) {
                $enabled[] = $defaultGateway;
            }

            $existing = [];
            try {
                $existing = PlatformSetting::getValue('payment_settings', []);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Could not load existing payment_settings', ['error' => $e->getMessage()]);
            }
            if (! is_array($existing)) {
                $existing = [];
            }

            $existingGateways = $existing['gateways'] ?? [];
            $requestGateways = $request->gateways ?? [];
            if (! is_array($requestGateways)) {
                $requestGateways = [];
            }
            if (! is_array($existingGateways)) {
                $existingGateways = [];
            }

            $gateways = [];
            foreach ($availableKeys as $key) {
                $config = $requestGateways[$key] ?? $existingGateways[$key] ?? null;
                if ($config === null || ! is_array($config)) {
                    $gateways[$key] = [
                        'mode' => $key === 'paypal' ? 'sandbox' : 'test',
                        'logo_url' => '',
                        'credentials' => [],
                    ];
                    continue;
                }
                $mode = isset($config['mode']) && is_string($config['mode']) ? $config['mode'] : 'test';
                $mode = in_array($mode, ['test', 'live', 'sandbox'], true) ? $mode : 'test';
                $logoUrl = isset($config['logo_url']) && is_string($config['logo_url'])
                    ? substr($config['logo_url'], 0, 1000)
                    : '';
                $credentials = is_array($config['credentials'] ?? null) ? $config['credentials'] : [];
                $cleanCreds = [];
                foreach ($credentials as $k => $v) {
                    if (is_string($v) || is_numeric($v)) {
                        $cleanCreds[is_string($k) ? $k : (string) $k] = (string) $v;
                    }
                }

                $gateways[$key] = [
                    'mode' => $mode,
                    'logo_url' => $logoUrl,
                    'credentials' => $cleanCreds,
                ];
            }

            $paymentSettings = [
                'default_gateway' => $defaultGateway,
                'enabled_gateways' => $enabled,
                'gateways' => $gateways,
            ];

            // Ensure JSON-serializable and save via DB to avoid cast issues
            $json = json_encode($paymentSettings, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
            $now = now();
            \Illuminate\Support\Facades\DB::table('platform_settings')->updateOrInsert(
                ['key' => 'payment_settings'],
                [
                    'value' => $json,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment gateway settings saved successfully.',
                'data' => [
                    'payment_settings' => $paymentSettings,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\JsonException $e) {
            \Illuminate\Support\Facades\Log::error('Payment settings JSON encode failed', ['message' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid payment data: ' . $e->getMessage(),
            ], 500);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Payment settings save failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save payment settings. Run: php artisan migrate. Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload a gateway logo image. Returns the public URL for use as logo_url.
     */
    public function uploadGatewayLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,webp,svg|max:2048', // 2MB max
            'gateway_key' => 'nullable|string|max:64',
        ]);

        $gatewayKey = $request->input('gateway_key', 'gateway');
        $file = $request->file('logo');
        $ext = $file->getClientOriginalExtension() ?: $file->guessExtension();
        $filename = \Illuminate\Support\Str::slug($gatewayKey) . '-' . time() . '.' . $ext;
        $path = $file->storeAs('gateway-logos', $filename, 'public');

        $url = url(Storage::url($path));

        return response()->json([
            'success' => true,
            'logo_url' => $url,
            'message' => 'Logo uploaded successfully.',
        ]);
    }
}
