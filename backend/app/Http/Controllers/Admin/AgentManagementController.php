<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;

class AgentManagementController extends Controller
{
    /**
     * Display a listing of agents.
     */
    public function index(Request $request)
    {
        $query = Agent::with('seller');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $agents = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $agents,
        ]);
    }

    /**
     * Update agent status (approve/reject).
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:active,pending,inactive',
        ]);

        $agent = Agent::findOrFail($id);
        $agent->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Agent status updated successfully',
            'data' => $agent,
        ]);
    }

    /**
     * Remove the specified agent.
     */
    public function destroy(string $id)
    {
        $agent = Agent::findOrFail($id);
        $agent->delete();

        return response()->json([
            'success' => true,
            'message' => 'Agent deleted successfully',
        ]);
    }
}
