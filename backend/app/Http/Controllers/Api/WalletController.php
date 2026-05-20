<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        protected WalletService $walletService
    ) {}

    /**
     * Get current user's wallet (vendor or admin).
     */
    public function index(Request $request)
    {
        if (!$request->user()->isVendor() && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Wallet is only available for vendors and admins.',
            ], 403);
        }

        $wallet = $this->walletService->getOrCreateWallet($request->user());

        // Backfill wallet from all past sales (so balance matches dashboard Total Revenue)
        $this->walletService->syncWalletFromSales($request->user());
        $wallet->refresh();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $wallet->id,
                'balance' => (float) $wallet->balance,
                'currency' => $wallet->currency,
                'status' => $wallet->status,
            ],
        ]);
    }

    /**
     * Get wallet transactions (paginated).
     */
    public function transactions(Request $request)
    {
        if (!$request->user()->isVendor() && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $wallet = $this->walletService->getOrCreateWallet($request->user());

        $perPage = min((int) $request->get('per_page', 20), 50);
        $transactions = $wallet->transactions()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => array_map(function ($t) {
                return [
                    'id' => $t->id,
                    'type' => $t->type,
                    'amount' => (float) $t->amount,
                    'balance_after' => (float) $t->balance_after,
                    'reference_type' => $t->reference_type,
                    'description' => $t->description,
                    'created_at' => $t->created_at->toISOString(),
                ];
            }, $transactions->items()),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Request withdrawal.
     */
    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
            'notes' => 'nullable|string|max:500',
        ]);

        if (!$request->user()->isVendor() && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $wallet = $this->walletService->getOrCreateWallet($request->user());
        $amount = (float) $request->amount;

        try {
            $withdrawal = $this->walletService->createWithdrawalRequest(
                $wallet,
                $amount,
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal request submitted successfully.',
                'data' => [
                    'id' => $withdrawal->id,
                    'amount' => (float) $withdrawal->amount,
                    'status' => $withdrawal->status,
                    'requested_at' => $withdrawal->requested_at->toISOString(),
                ],
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get current user's withdrawal requests.
     */
    public function withdrawals(Request $request)
    {
        if (!$request->user()->isVendor() && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $wallet = $this->walletService->getOrCreateWallet($request->user());

        $requests = $wallet->withdrawalRequests()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests->map(function ($r) {
                return [
                    'id' => $r->id,
                    'amount' => (float) $r->amount,
                    'status' => $r->status,
                    'payment_reference' => $r->payment_reference,
                    'requested_at' => $r->requested_at->toISOString(),
                    'processed_at' => $r->processed_at?->toISOString(),
                ];
            }),
        ]);
    }
}
