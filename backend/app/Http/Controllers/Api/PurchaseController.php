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

        $user = $request->user();
        $agents = $user->agents()->get();
        
        $totalListings = $agents->count();
        $activeListings = $agents->where('status', 'active')->count();
        $pendingListings = $agents->where('status', 'pending')->count();
        $totalSales = $agents->sum('sales') ?? 0;
        $totalRevenue = $agents->sum(function ($agent) {
            return ($agent->price ?? 0) * ($agent->sales ?? 0) * 0.85; // 85% commission
        });
        $totalViews = ($agents->sum('sales') ?? 0) * 10; // Mock calculation

        // Get recent listings
        $recentListings = $agents->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'price' => (float) ($agent->price ?? 0),
                    'status' => $agent->status ?? 'pending',
                ];
            });

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
                    'id' => $purchase->id,
                    'agent_name' => $purchase->agent_name,
                    'total_amount' => (float) $purchase->total_amount,
                    'purchase_date' => $purchase->purchase_date->toISOString(),
                    'user' => $purchase->user ? [
                        'name' => $purchase->user->name,
                        'email' => $purchase->user->email,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_listings' => (int) $totalListings,
                    'active_listings' => (int) $activeListings,
                    'pending_listings' => (int) $pendingListings,
                    'total_sales' => (int) $totalSales,
                    'total_revenue' => (float) $totalRevenue,
                    'views' => (int) $totalViews,
                ],
                'recent_listings' => $recentListings->toArray(),
                'recent_sales' => $recentSales->toArray(),
            ],
        ]);
    }
}
