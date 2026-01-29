<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;

/**
 * Public API for checkout: returns enabled payment gateways (no credentials).
 */
class PaymentGatewayController extends Controller
{
    /**
     * List enabled payment gateways for customer checkout.
     * Returns default_gateway and gateways with key, name, region, logo_url only.
     */
    public function index(Request $request)
    {
        $paymentSettings = PlatformSetting::getValue('payment_settings', []);
        $defaultGateway = $paymentSettings['default_gateway'] ?? 'stripe';
        $enabledKeys = $paymentSettings['enabled_gateways'] ?? ['stripe', 'paypal'];
        $gatewaysConfig = $paymentSettings['gateways'] ?? [];

        $gatewayNames = [
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

        $list = [];
        foreach ($enabledKeys as $key) {
            $info = $gatewayNames[$key] ?? ['name' => ucfirst($key), 'region' => '—'];
            $config = $gatewaysConfig[$key] ?? [];
            $list[] = [
                'key' => $key,
                'name' => $info['name'],
                'region' => $info['region'],
                'logo_url' => $config['logo_url'] ?? '',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'default_gateway' => $defaultGateway,
                'gateways' => $list,
            ],
        ]);
    }
}
