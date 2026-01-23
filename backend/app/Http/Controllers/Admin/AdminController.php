<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Agent;
use App\Models\Purchase;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_agents' => Agent::count(),
            'active_agents' => Agent::where('status', 'active')->count(),
            'pending_agents' => Agent::where('status', 'pending')->count(),
            'total_purchases' => Purchase::count(),
            'total_revenue' => Purchase::sum('total_amount'),
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
}
