<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    /**
     * Get user's purchase history
     */
    public function index(Request $request)
    {
        $purchases = Purchase::where('user_id', $request->user()->id)
            ->with('agent')
            ->orderBy('purchase_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $purchases->map(function ($purchase) {
                return [
                    'id' => $purchase->id,
                    'agentId' => $purchase->agent_id,
                    'agentName' => $purchase->agent_name,
                    'price' => (float) $purchase->price,
                    'quantity' => $purchase->quantity,
                    'totalAmount' => (float) $purchase->total_amount,
                    'purchaseDate' => $purchase->purchase_date->toISOString(),
                ];
            }),
        ]);
    }

    /**
     * Complete purchase from cart
     */
    public function store(Request $request)
    {
        $cartItems = CartItem::where('user_id', $request->user()->id)
            ->with('agent')
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty',
            ], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($cartItems as $cartItem) {
                $agent = $cartItem->agent;
                $totalAmount = $agent->price * $cartItem->quantity;

                // Create purchase record
                Purchase::create([
                    'user_id' => $request->user()->id,
                    'agent_id' => $agent->id,
                    'agent_name' => $agent->name,
                    'price' => $agent->price,
                    'quantity' => $cartItem->quantity,
                    'total_amount' => $totalAmount,
                    'purchase_date' => now(),
                ]);

                // Update agent sales count
                $agent->increment('sales', $cartItem->quantity);
            }

            // Clear cart
            CartItem::where('user_id', $request->user()->id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Purchase completed successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Purchase failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get dashboard statistics (for vendors)
     */
    public function dashboard(Request $request)
    {
        if (!$request->user()->isVendor() && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $agents = $request->user()->agents;
        $activeListings = $agents->where('status', 'active')->count();
        $totalSales = $agents->sum('sales');
        $totalRevenue = $agents->sum(function ($agent) {
            return $agent->price * $agent->sales * 0.85; // 85% commission
        });
        $totalViews = $agents->sum('sales') * 10; // Mock calculation

        // Get recent sales
        $recentSales = Purchase::whereHas('agent', function ($query) use ($request) {
            $query->where('seller_id', $request->user()->id);
        })
            ->with('user')
            ->orderBy('purchase_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($purchase) {
                return [
                    'agentName' => $purchase->agent_name,
                    'buyer' => $purchase->user ? $purchase->user->email : 'N/A',
                    'amount' => (float) $purchase->total_amount,
                    'date' => $purchase->purchase_date->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'totalRevenue' => (float) $totalRevenue,
                    'activeListings' => $activeListings,
                    'totalSales' => $totalSales,
                    'totalViews' => $totalViews,
                ],
                'recentSales' => $recentSales,
            ],
        ]);
    }
}
