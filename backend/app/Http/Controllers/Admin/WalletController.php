<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WithdrawalRequest;
use App\Services\WalletService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        protected WalletService $walletService
    ) {}

    /**
     * List all wallets (vendors and admins with wallets).
     */
    public function index(Request $request)
    {
        $query = Wallet::with('user:id,name,email,role');

        if ($request->filled('role')) {
            $query->whereHas('user', fn ($q) => $q->where('role', $request->role));
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
            );
        }

        $wallets = $query->orderBy('updated_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $wallets->map(function ($w) {
                return [
                    'id' => $w->id,
                    'user_id' => $w->user_id,
                    'user' => $w->user ? [
                        'id' => $w->user->id,
                        'name' => $w->user->name,
                        'email' => $w->user->email,
                        'role' => $w->user->role,
                    ] : null,
                    'balance' => (float) $w->balance,
                    'currency' => $w->currency,
                    'status' => $w->status,
                ];
            }),
            'meta' => [
                'current_page' => $wallets->currentPage(),
                'last_page' => $wallets->lastPage(),
                'per_page' => $wallets->perPage(),
                'total' => $wallets->total(),
            ],
        ]);
    }

    /**
     * Get single wallet with transactions.
     */
    public function show(string $id)
    {
        $wallet = Wallet::with('user:id,name,email,role')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $wallet->id,
                'user' => $wallet->user ? [
                    'id' => $wallet->user->id,
                    'name' => $wallet->user->name,
                    'email' => $wallet->user->email,
                    'role' => $wallet->user->role,
                ] : null,
                'balance' => (float) $wallet->balance,
                'currency' => $wallet->currency,
                'status' => $wallet->status,
            ],
        ]);
    }

    /**
     * List all withdrawal requests (pending first).
     */
    public function withdrawals(Request $request)
    {
        $query = WithdrawalRequest::with(['wallet.user:id,name,email']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->orderByRaw("CASE WHEN status = 'pending' THEN 0 WHEN status = 'approved' THEN 1 ELSE 2 END")
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $withdrawals->map(function ($w) {
                return [
                    'id' => $w->id,
                    'wallet_id' => $w->wallet_id,
                    'amount' => (float) $w->amount,
                    'status' => $w->status,
                    'payment_reference' => $w->payment_reference,
                    'notes' => $w->notes,
                    'requested_at' => $w->requested_at->toISOString(),
                    'processed_at' => $w->processed_at?->toISOString(),
                    'user' => $w->wallet && $w->wallet->user ? [
                        'id' => $w->wallet->user->id,
                        'name' => $w->wallet->user->name,
                        'email' => $w->wallet->user->email,
                    ] : null,
                ];
            }),
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page' => $withdrawals->lastPage(),
                'per_page' => $withdrawals->perPage(),
                'total' => $withdrawals->total(),
            ],
        ]);
    }

    /**
     * Update withdrawal status (approve, reject, or mark as paid).
     */
    public function updateWithdrawal(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,paid',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $withdrawal = WithdrawalRequest::findOrFail($id);

        if (!$withdrawal->isPending() && $withdrawal->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal request can no longer be updated.',
            ], 422);
        }

        if ($request->status === 'paid' && $withdrawal->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Approve the withdrawal first before marking as paid.',
            ], 422);
        }

        try {
            $this->walletService->updateWithdrawalStatus(
                $withdrawal,
                $request->status,
                $request->user()->id,
                $request->payment_reference,
                $request->notes
            );

            $withdrawal->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal request updated successfully.',
                'data' => [
                    'id' => $withdrawal->id,
                    'amount' => (float) $withdrawal->amount,
                    'status' => $withdrawal->status,
                    'payment_reference' => $withdrawal->payment_reference,
                    'processed_at' => $withdrawal->processed_at?->toISOString(),
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
