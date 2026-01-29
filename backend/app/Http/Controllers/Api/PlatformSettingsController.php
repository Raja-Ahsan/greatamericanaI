<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;

/**
 * Public API for platform display settings (seller commission, platform fee, name).
 * Used on vendor/customer pages; values are set by admin in Admin Settings.
 */
class PlatformSettingsController extends Controller
{
    /**
     * Get platform display settings (seller commission %, platform fee %, platform name).
     */
    public function index()
    {
        $platform = PlatformSetting::getValue('platform', [
            'platformName' => 'GreatAmerican.Ai',
            'platformFee' => 15,
            'sellerCommission' => 85,
        ]);

        if (! is_array($platform)) {
            $platform = [
                'platformName' => 'GreatAmerican.Ai',
                'platformFee' => 15,
                'sellerCommission' => 85,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'platformName' => $platform['platformName'] ?? 'GreatAmerican.Ai',
                'platformFee' => (int) ($platform['platformFee'] ?? 15),
                'sellerCommission' => (int) ($platform['sellerCommission'] ?? 85),
            ],
        ]);
    }
}
