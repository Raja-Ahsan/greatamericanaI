<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Purchase;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DummySalesSeeder extends Seeder
{
    /**
     * Seed dummy sales (purchases) for testing wallet integration.
     * Creates purchase records for vendors' agents, then syncs wallet balance.
     */
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $vendors = User::whereIn('role', ['vendor', 'admin'])->get();

        if ($customers->isEmpty()) {
            $this->command->warn('No customer users found. Create a customer (e.g. run DatabaseSeeder) first.');
            return;
        }

        if ($vendors->isEmpty()) {
            $this->command->warn('No vendor/admin users found. Create a vendor first.');
            return;
        }

        $walletService = app(WalletService::class);
        $totalPurchases = 0;

        foreach ($vendors as $vendor) {
            $agents = Agent::where('seller_id', $vendor->id)->get();
            if ($agents->isEmpty()) {
                $this->command->info("No agents for vendor {$vendor->email}, skipping.");
                continue;
            }

            foreach ($agents as $agent) {
                // Create 3–8 dummy purchases per agent for testing
                $numSales = rand(3, 8);
                for ($i = 0; $i < $numSales; $i++) {
                    $buyer = $customers->random();
                    $quantity = rand(1, 3);
                    $totalAmount = (float) $agent->price * $quantity;
                    $daysAgo = rand(1, 60);
                    $purchaseDate = Carbon::now()->subDays($daysAgo);

                    Purchase::create([
                        'user_id' => $buyer->id,
                        'agent_id' => $agent->id,
                        'agent_name' => $agent->name,
                        'price' => $agent->price,
                        'quantity' => $quantity,
                        'total_amount' => $totalAmount,
                        'purchase_date' => $purchaseDate,
                    ]);
                    $totalPurchases++;
                }
            }

            // Sync wallet from all sales (including these new purchases)
            $walletService->syncWalletFromSales($vendor);
            $this->command->info("Synced wallet for vendor: {$vendor->email}");
        }

        $this->command->info("Dummy sales seeding complete. Created {$totalPurchases} purchase(s).");
        $this->command->info('Vendors can now test: Wallet page balance, transactions, and withdrawal requests.');
    }
}
