<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Support\Facades\DB;

class WalletService
{
    public const VENDOR_COMMISSION = 0.85; // 85% to vendor
    public const PLATFORM_FEE = 0.15; // 15% platform

    /**
     * Get or create wallet for user (vendors and admins only).
     */
    public function getOrCreateWallet(User $user): Wallet
    {
        $wallet = $user->wallet;

        if (!$wallet) {
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
                'currency' => 'USD',
                'status' => 'active',
            ]);
        }

        return $wallet;
    }

    /**
     * Sync wallet balance from all past sales (backfill). Credits 85% for each purchase
     * where the vendor's agent was sold and no wallet transaction exists yet.
     */
    public function syncWalletFromSales(User $user): void
    {
        if (!$user->isVendor() && !$user->isAdmin()) {
            return;
        }

        $wallet = $this->getOrCreateWallet($user);
        if ($wallet->isLocked()) {
            return;
        }

        // Purchases of this vendor's agents (agent.seller_id = user.id)
        $purchases = Purchase::whereHas('agent', function ($q) use ($user) {
            $q->where('seller_id', $user->id);
        })->with('agent')->get();

        $creditedIds = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('reference_type', 'sale')
            ->pluck('reference_id')
            ->flip()
            ->all();

        $toCredit = $purchases->filter(function (Purchase $p) use ($creditedIds) {
            return !isset($creditedIds[$p->id]);
        });

        if ($toCredit->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($wallet, $toCredit) {
            $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
            $balance = (float) $wallet->balance;

            foreach ($toCredit as $purchase) {
                $amount = (float) $purchase->total_amount * self::VENDOR_COMMISSION;
                if ($amount <= 0) {
                    continue;
                }
                $balance += $amount;
                $wallet->update(['balance' => $balance]);

                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => 'credit',
                    'amount' => $amount,
                    'balance_after' => $balance,
                    'reference_type' => 'sale',
                    'reference_id' => $purchase->id,
                    'description' => "Sale: {$purchase->agent_name} (Qty: {$purchase->quantity})",
                    'meta' => [
                        'purchase_id' => $purchase->id,
                        'agent_id' => $purchase->agent_id,
                    ],
                ]);
            }
        });
    }

    /**
     * Credit vendor wallet on sale (85% of sale amount).
     */
    public function creditVendorOnSale(Purchase $purchase): void
    {
        $agent = $purchase->agent;
        if (!$agent || !$agent->seller_id) {
            return;
        }

        $vendor = $agent->seller;
        if (!$vendor->isVendor() && !$vendor->isAdmin()) {
            return;
        }

        $amount = (float) $purchase->total_amount * self::VENDOR_COMMISSION;
        if ($amount <= 0) {
            return;
        }

        $wallet = $this->getOrCreateWallet($vendor);

        if ($wallet->isLocked()) {
            return;
        }

        DB::transaction(function () use ($wallet, $amount, $purchase) {
            $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
            $newBalance = (float) $wallet->balance + $amount;
            $wallet->update(['balance' => $newBalance]);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reference_type' => 'sale',
                'reference_id' => $purchase->id,
                'description' => "Sale: {$purchase->agent_name} (Qty: {$purchase->quantity})",
                'meta' => [
                    'purchase_id' => $purchase->id,
                    'agent_id' => $purchase->agent_id,
                ],
            ]);
        });
    }

    /**
     * Create withdrawal request (debit from balance when approved).
     */
    public function createWithdrawalRequest(Wallet $wallet, float $amount, ?string $notes = null): WithdrawalRequest
    {
        if ($wallet->isLocked()) {
            throw new \InvalidArgumentException('Wallet is locked.');
        }

        $balance = (float) $wallet->balance;
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Amount must be greater than zero.');
        }
        if ($amount > $balance) {
            throw new \InvalidArgumentException('Insufficient balance.');
        }

        $minWithdrawal = 10; // Minimum $10
        if ($amount < $minWithdrawal) {
            throw new \InvalidArgumentException("Minimum withdrawal amount is \${$minWithdrawal}.");
        }

        return DB::transaction(function () use ($wallet, $amount, $notes) {
            // Check pending + approved total
            $pendingTotal = (float) $wallet->withdrawalRequests()
                ->whereIn('status', ['pending', 'approved'])
                ->sum('amount');
            if ($pendingTotal + $amount > (float) $wallet->balance) {
                throw new \InvalidArgumentException('Insufficient balance (including pending withdrawals).');
            }

            return WithdrawalRequest::create([
                'wallet_id' => $wallet->id,
                'amount' => $amount,
                'status' => 'pending',
                'notes' => $notes,
                'requested_at' => now(),
            ]);
        });
    }

    /**
     * Process withdrawal: approve (no debit yet) or reject.
     */
    public function updateWithdrawalStatus(WithdrawalRequest $request, string $status, ?int $processedBy = null, ?string $paymentRef = null, ?string $notes = null): void
    {
        if (!in_array($status, ['approved', 'rejected', 'paid'])) {
            throw new \InvalidArgumentException('Invalid status.');
        }

        if (!$request->isPending() && $request->status !== 'approved') {
            throw new \InvalidArgumentException('Withdrawal request can no longer be updated.');
        }

        DB::transaction(function () use ($request, $status, $processedBy, $paymentRef, $notes) {
            $request->update([
                'status' => $status,
                'processed_at' => now(),
                'processed_by' => $processedBy,
                'payment_reference' => $paymentRef ?? $request->payment_reference,
                'notes' => $notes ?? $request->notes,
            ]);

            if ($status === 'paid') {
                $wallet = Wallet::where('id', $request->wallet_id)->lockForUpdate()->first();
                $amount = (float) $request->amount;
                $balance = (float) $wallet->balance;
                if ($amount > $balance) {
                    throw new \InvalidArgumentException('Insufficient wallet balance to mark as paid.');
                }
                $newBalance = $balance - $amount;
                $wallet->update(['balance' => $newBalance]);

                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => 'debit',
                    'amount' => $amount,
                    'balance_after' => $newBalance,
                    'reference_type' => 'withdrawal',
                    'reference_id' => $request->id,
                    'description' => 'Withdrawal payout',
                    'meta' => [
                        'withdrawal_request_id' => $request->id,
                        'payment_reference' => $request->payment_reference,
                    ],
                ]);
            }
        });
    }
}
