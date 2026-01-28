<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VendorSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get current user's vendor settings.
     */
    public function index(Request $request)
    {
        if (!$request->user()->isVendor() && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Settings are only available for vendors and admins.',
            ], 403);
        }

        $setting = VendorSetting::where('user_id', $request->user()->id)->first();

        return response()->json([
            'success' => true,
            'data' => $setting ? $setting->settings : [],
        ]);
    }

    /**
     * Update current user's vendor settings.
     */
    public function update(Request $request)
    {
        if (!$request->user()->isVendor() && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'settings' => 'required|array',
            'settings.notifications' => 'nullable|array',
            'settings.notifications.newSale' => 'nullable|boolean',
            'settings.notifications.withdrawalProcessed' => 'nullable|boolean',
            'settings.notifications.newMessage' => 'nullable|boolean',
            'settings.notifications.weeklySummary' => 'nullable|boolean',
            'settings.payoutMethod' => 'nullable|string|in:paypal,bank_transfer,other',
            'settings.payoutEmail' => 'nullable|string|email|max:255',
            'settings.bankAccountHolder' => 'nullable|string|max:255',
            'settings.bankName' => 'nullable|string|max:255',
            'settings.bankAccountNumber' => 'nullable|string|max:255',
            'settings.bankRoutingOrSwift' => 'nullable|string|max:255',
            'settings.payoutNotes' => 'nullable|string|max:1000',
            'settings.payoutFrequency' => 'nullable|string|in:weekly,biweekly,monthly,',
            'settings.timezone' => 'nullable|string|max:100',
        ]);

        $setting = VendorSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['settings' => $request->settings]
        );

        return response()->json([
            'success' => true,
            'message' => 'Settings saved successfully.',
            'data' => $setting->settings,
        ]);
    }
}
