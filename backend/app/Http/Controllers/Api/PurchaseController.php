<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Purchase;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function __construct(
        protected WalletService $walletService
    ) {}

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
     * Get purchases by encrypted order-success token (validates token and user).
     */
    public function byToken(Request $request)
    {
        $token = $request->query('token');
        if (! $token) {
            return response()->json(['success' => false, 'message' => 'Missing token'], 400);
        }

        try {
            $decrypted = \Illuminate\Support\Facades\Crypt::decryptString($token);
            $payload = json_decode($decrypted, true);
            if (! is_array($payload) || empty($payload['order_ids']) || empty($payload['user_id'])) {
                return response()->json(['success' => false, 'message' => 'Invalid token'], 400);
            }
            $orderIds = $payload['order_ids'];
            $userId = (int) $payload['user_id'];
            if ($userId !== (int) $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired token'], 400);
        }

        $purchases = Purchase::where('user_id', $userId)
            ->whereIn('id', $orderIds)
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
                $purchaseRecord = Purchase::create([
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

                // Credit vendor wallet (85% of sale)
                $this->walletService->creditVendorOnSale($purchaseRecord);
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
        $totalSales = (int) ($agents->sum('sales') ?? 0);

        // Total revenue from actual purchases (85% commission) – matches wallet balance source
        $totalRevenue = (float) Purchase::whereHas('agent', function ($q) use ($user) {
            $q->where('seller_id', $user->id);
        })->get()->sum(fn ($p) => (float) $p->total_amount * 0.85);

        $totalViews = $totalSales * 10; // Mock calculation

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

    /**
     * Get analytics data for vendor (charts, top agents, revenue by period).
     */
    public function analytics(Request $request)
    {
        if (!$request->user()->isVendor() && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $user = $request->user();

        // Base query: purchases of this vendor's agents
        $purchasesQuery = Purchase::whereHas('agent', function ($q) use ($user) {
            $q->where('seller_id', $user->id);
        });

        // Stats
        $agents = $user->agents()->get();
        $totalListings = $agents->count();
        $activeListings = $agents->where('status', 'active')->count();
        $totalSales = (int) $agents->sum('sales');
        $totalRevenue = (float) $purchasesQuery->get()->sum(fn ($p) => (float) $p->total_amount * 0.85);

        // Revenue by day (last 30 days)
        $revenueByDay = Purchase::whereHas('agent', function ($q) use ($user) {
            $q->where('seller_id', $user->id);
        })
            ->select(
                DB::raw('DATE(purchase_date) as date'),
                DB::raw('SUM(total_amount) * 0.85 as revenue'),
                DB::raw('COUNT(*) as sales_count'),
                DB::raw('SUM(quantity) as units')
            )
            ->where('purchase_date', '>=', now()->subDays(30))
            ->groupBy(DB::raw('DATE(purchase_date)'))
            ->orderBy('date')
            ->get()
            ->map(function ($row) {
                return [
                    'date' => $row->date,
                    'revenue' => (float) $row->revenue,
                    'sales_count' => (int) $row->sales_count,
                    'units' => (int) $row->units,
                ];
            });

        // Top agents by revenue (from actual purchases)
        $topAgentsRaw = Purchase::whereHas('agent', function ($q) use ($user) {
            $q->where('seller_id', $user->id);
        })
            ->select(
                'agent_id',
                'agent_name',
                DB::raw('SUM(quantity) as units_sold'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as gross'),
                DB::raw('SUM(total_amount) * 0.85 as revenue')
            )
            ->groupBy('agent_id', 'agent_name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $topAgents = $topAgentsRaw->map(function ($row) {
            return [
                'agent_id' => $row->agent_id,
                'agent_name' => $row->agent_name,
                'units_sold' => (int) $row->units_sold,
                'order_count' => (int) $row->order_count,
                'gross' => (float) $row->gross,
                'revenue' => (float) $row->revenue,
            ];
        });

        // Recent sales (last 15)
        $recentSales = Purchase::whereHas('agent', function ($q) use ($user) {
            $q->where('seller_id', $user->id);
        })
            ->with('user')
            ->orderBy('purchase_date', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'agent_name' => $p->agent_name,
                    'quantity' => $p->quantity,
                    'total_amount' => (float) $p->total_amount,
                    'revenue' => (float) $p->total_amount * 0.85,
                    'purchase_date' => $p->purchase_date->toISOString(),
                    'user' => $p->user ? ['name' => $p->user->name, 'email' => $p->user->email] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_listings' => (int) $totalListings,
                    'active_listings' => (int) $activeListings,
                    'total_sales' => (int) $totalSales,
                    'total_revenue' => (float) $totalRevenue,
                ],
                'revenue_by_day' => $revenueByDay->toArray(),
                'top_agents' => $topAgents->toArray(),
                'recent_sales' => $recentSales->toArray(),
            ],
        ]);
    }
}
