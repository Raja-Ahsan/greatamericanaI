<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Agent;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $grossRevenue = (float) Purchase::sum('total_amount');
        $platformFeeRate = 0.15; // 15% platform fee
        $adminProfit = round($grossRevenue * $platformFeeRate, 2);

        $stats = [
            'total_users' => User::count(),
            'total_agents' => Agent::count(),
            'active_agents' => Agent::where('status', 'active')->count(),
            'pending_agents' => Agent::where('status', 'pending')->count(),
            'total_purchases' => Purchase::count(),
            'total_revenue' => $grossRevenue,
            'admin_profit' => $adminProfit,
            'total_vendors' => User::where('role', 'vendor')->count(),
            'total_customers' => User::where('role', 'customer')->count(),
        ];

        $recent_users = User::latest()->limit(10)->get();
        $recent_agents = Agent::with('seller')->latest()->limit(10)->get();
        $recent_purchases = Purchase::with(['user', 'agent'])->latest()->limit(10)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_users' => $recent_users,
                'recent_agents' => $recent_agents,
                'recent_purchases' => $recent_purchases,
            ],
        ]);
    }

    /**
     * Platform-wide analytics for admin (revenue by day, top agents, recent purchases).
     */
    public function analytics()
    {
        $grossRevenue = (float) Purchase::sum('total_amount');
        $platformFeeRate = 0.15;
        $adminProfit = round($grossRevenue * $platformFeeRate, 2);

        $stats = [
            'total_users' => User::count(),
            'total_agents' => Agent::count(),
            'active_agents' => Agent::where('status', 'active')->count(),
            'pending_agents' => Agent::where('status', 'pending')->count(),
            'total_purchases' => Purchase::count(),
            'total_revenue' => $grossRevenue,
            'admin_profit' => $adminProfit,
            'total_vendors' => User::where('role', 'vendor')->count(),
            'total_customers' => User::where('role', 'customer')->count(),
        ];

        // Revenue & admin profit by day (last 30 days)
        $revenueByDay = Purchase::select(
            DB::raw('DATE(purchase_date) as date'),
            DB::raw('SUM(total_amount) as gross'),
            DB::raw('SUM(total_amount) * ' . $platformFeeRate . ' as admin_profit'),
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
                    'gross' => (float) $row->gross,
                    'admin_profit' => (float) $row->admin_profit,
                    'sales_count' => (int) $row->sales_count,
                    'units' => (int) $row->units,
                ];
            });

        // Top selling agents (platform-wide)
        $topAgents = Purchase::select(
            'agent_id',
            'agent_name',
            DB::raw('SUM(quantity) as units_sold'),
            DB::raw('COUNT(*) as order_count'),
            DB::raw('SUM(total_amount) as gross'),
            DB::raw('SUM(total_amount) * ' . $platformFeeRate . ' as platform_fee')
        )
            ->groupBy('agent_id', 'agent_name')
            ->orderByDesc('gross')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                return [
                    'agent_id' => $row->agent_id,
                    'agent_name' => $row->agent_name,
                    'units_sold' => (int) $row->units_sold,
                    'order_count' => (int) $row->order_count,
                    'gross' => (float) $row->gross,
                    'platform_fee' => (float) $row->platform_fee,
                ];
            });

        // Recent purchases (last 15)
        $recentPurchases = Purchase::with(['user', 'agent.seller'])
            ->orderBy('purchase_date', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'agent_name' => $p->agent_name,
                    'quantity' => $p->quantity,
                    'total_amount' => (float) $p->total_amount,
                    'platform_fee' => (float) $p->total_amount * 0.15,
                    'purchase_date' => $p->purchase_date->toISOString(),
                    'user' => $p->user ? ['name' => $p->user->name, 'email' => $p->user->email] : null,
                    'seller' => $p->agent && $p->agent->seller ? $p->agent->seller->name : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'revenue_by_day' => $revenueByDay->toArray(),
                'top_agents' => $topAgents->toArray(),
                'recent_purchases' => $recentPurchases->toArray(),
            ],
        ]);
    }
}
