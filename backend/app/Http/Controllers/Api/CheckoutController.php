<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\PlatformSetting;
use App\Models\Purchase;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function __construct(
        protected WalletService $walletService
    ) {}

    /**
     * Create payment with selected gateway; returns redirect URL to gateway (Stripe, PayPal, etc.).
     */
    public function createPayment(Request $request)
    {
        $request->validate([
            'gateway' => 'required|string|in:stripe,paypal,paymob,fawry,tabby,moyasar,myfatoorah,urway,geidea,telr,tamara,alrajhibank,clickpay,hyperpay,tap',
        ]);

        $user = $request->user();
        $cartItems = CartItem::where('user_id', $user->id)->with('agent')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Cart is empty'], 400);
        }

        $platform = PlatformSetting::getValue('platform', []);
        $taxRate = (int) ($platform['taxRate'] ?? 10);
        $subtotal = 0;
        $cartSnapshot = [];

        foreach ($cartItems as $item) {
            $agent = $item->agent;
            $lineTotal = (float) $agent->price * $item->quantity;
            $subtotal += $lineTotal;
            $cartSnapshot[] = [
                'cart_item_id' => $item->id,
                'agent_id' => $agent->id,
                'agent_name' => $agent->name,
                'price' => (float) $agent->price,
                'quantity' => $item->quantity,
                'total_amount' => $lineTotal,
            ];
        }

        $taxAmount = $subtotal * ($taxRate / 100);
        $total = $subtotal + $taxAmount;

        $paymentToken = Str::random(64);
        $gateway = $request->gateway;

        // Stripe requires success_url to include {CHECKOUT_SESSION_ID} so it can append the session ID on redirect
        $callbackUrl = url('/api/payment/callback').'?payment_token='.$paymentToken.'&gateway='.$gateway.'&session_id={CHECKOUT_SESSION_ID}';
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
        $failedOrCancelUrl = $frontendUrl.'/checkout?payment=failed';

        Cache::put('payment_'.$paymentToken, [
            'user_id' => $user->id,
            'cart_snapshot' => $cartSnapshot,
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'total' => $total,
            'gateway' => $gateway,
        ], now()->addMinutes(30));

        Config::set('payments.success_url', $callbackUrl);
        Config::set('payments.callback_url', $callbackUrl);
        Config::set('payments.failed_url', $failedOrCancelUrl);

        $payRequest = new Request([
            'amount' => round($total, 2),
            'currency' => 'usd',
        ]);

        try {
            $gatewayInstance = \Arafa\Payments\Facades\Payment::gateway($gateway);
            $result = $gatewayInstance->sendPayment($payRequest);

            if (! empty($result['success']) && ! empty($result['url'])) {
                return response()->json([
                    'success' => true,
                    'redirect_url' => $result['url'],
                ]);
            }

            $gatewayMessage = $result['message'] ?? null;
            $fallbackMessage = 'Payment gateway did not return a redirect URL. ';
            if ($gatewayMessage) {
                $fallbackMessage .= $gatewayMessage;
            } else {
                $fallbackMessage .= 'For Stripe: use the Secret key (sk_test_...) in "Test Secret Key" and the Publishable key (pk_test_...) in "Test Publishable Key"—do not put the secret key in the publishable field. Check Admin → Settings → Payment Gateways.';
            }
            Log::warning('Checkout createPayment: gateway did not return redirect_url', ['gateway' => $gateway, 'result' => $result]);
            return response()->json([
                'success' => false,
                'message' => $fallbackMessage,
            ], 500);
        } catch (\Throwable $e) {
            Log::error('Checkout createPayment failed', [
                'gateway' => $gateway,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $userMessage = 'Could not start payment. ';
            if (str_contains(strtolower($e->getMessage()), 'api') || str_contains(strtolower($e->getMessage()), 'key')) {
                $userMessage .= 'Check that the payment gateway API keys are set correctly in Admin → Settings → Payment Gateways.';
            } else {
                $userMessage .= $e->getMessage();
            }
            return response()->json([
                'success' => false,
                'message' => $userMessage,
            ], 500);
        }
    }

    /**
     * Payment callback (Stripe, PayPal, etc. redirect here after payment).
     * Verifies payment, creates purchases, clears cart, redirects to frontend order-success.
     */
    public function callback(Request $request)
    {
        $paymentToken = $request->query('payment_token');
        $gateway = $request->query('gateway');
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
        $checkoutFailed = $frontendUrl.'/checkout?payment=failed';

        if (! $paymentToken || ! $gateway) {
            Log::warning('Payment callback: missing payment_token or gateway', ['query' => $request->query()]);
            return redirect($frontendUrl.'/checkout?payment=invalid');
        }

        $data = Cache::get('payment_'.$paymentToken);
        if (! $data) {
            Log::warning('Payment callback: expired or invalid payment_token', ['payment_token' => substr($paymentToken, 0, 8).'...']);
            return redirect($frontendUrl.'/checkout?payment=expired');
        }

        try {
            $gatewayInstance = \Arafa\Payments\Facades\Payment::gateway($gateway);
            $response = $gatewayInstance->callBack($request);

            if (! ($response->success ?? false)) {
                Log::warning('Payment callback: gateway reported payment not successful', [
                    'gateway' => $gateway,
                    'response_success' => $response->success ?? null,
                    'response_status' => $response->status ?? null,
                ]);
                return redirect($checkoutFailed);
            }
        } catch (\Throwable $e) {
            Log::error('Payment callback: exception', [
                'gateway' => $gateway,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect($checkoutFailed);
        }

        $userId = $data['user_id'];
        $cartSnapshot = $data['cart_snapshot'];

        DB::beginTransaction();
        try {
            $orderIds = [];
            foreach ($cartSnapshot as $row) {
                $purchase = Purchase::create([
                    'user_id' => $userId,
                    'agent_id' => $row['agent_id'],
                    'agent_name' => $row['agent_name'],
                    'price' => $row['price'],
                    'quantity' => $row['quantity'],
                    'total_amount' => $row['total_amount'],
                    'purchase_date' => now(),
                ]);
                $orderIds[] = $purchase->id;
                $purchase->load('agent.seller');
                $purchase->agent->increment('sales', $row['quantity']);
                $this->walletService->creditVendorOnSale($purchase);
            }

            CartItem::whereIn('id', array_column($cartSnapshot, 'cart_item_id'))->delete();

            Cache::forget('payment_'.$paymentToken);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Payment callback: failed to create purchases', ['message' => $e->getMessage()]);
            return redirect($checkoutFailed);
        }

        $payload = ['order_ids' => $orderIds, 'user_id' => $userId];
        $token = Crypt::encryptString(json_encode($payload));
        return redirect($frontendUrl.'/order-success?token='.urlencode($token));
    }
}
