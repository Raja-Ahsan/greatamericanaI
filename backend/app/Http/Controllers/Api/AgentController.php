<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Agent::with('seller');

        // Filter by category
        if ($request->has('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'popular');
        switch ($sortBy) {
            case 'price-low':
                $query->orderBy('price', 'asc');
                break;
            case 'price-high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'newest':
                $query->orderBy('date_added', 'desc');
                break;
            default: // popular
                $query->orderBy('sales', 'desc');
        }

        // Only show active agents for public
        if (!$request->user() || !$request->user()->isAdmin()) {
            $query->where('status', 'active');
        }

        $agents = $query->get();

        return response()->json([
            'success' => true,
            'data' => $agents->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'description' => $agent->description,
                    'longDescription' => $agent->long_description,
                    'price' => (float) $agent->price,
                    'category' => $agent->category,
                    'rating' => (float) $agent->rating,
                    'reviews' => $agent->reviews,
                    'image' => $agent->image,
                    'seller' => [
                        'id' => $agent->seller->id,
                        'name' => $agent->seller->name,
                        'verified' => $agent->seller->verified,
                    ],
                    'capabilities' => $agent->capabilities ?? [],
                    'apiAccess' => $agent->api_access,
                    'model' => $agent->model,
                    'responseTime' => $agent->response_time,
                    'languages' => $agent->languages ?? [],
                    'tags' => $agent->tags ?? [],
                    'dateAdded' => $agent->date_added->format('Y-m-d'),
                    'sales' => $agent->sales,
                ];
            }),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'longDescription' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string',
            'model' => 'required|string',
            'responseTime' => 'required|string',
            'capabilities' => 'required|array',
            'languages' => 'required|array',
            'tags' => 'nullable|array',
            'image' => 'nullable|string',
        ]);

        $agent = Agent::create([
            'name' => $request->name,
            'description' => $request->description,
            'long_description' => $request->longDescription,
            'price' => $request->price,
            'category' => $request->category,
            'model' => $request->model,
            'response_time' => $request->responseTime,
            'capabilities' => $request->capabilities,
            'languages' => $request->languages,
            'tags' => $request->tags ?? [],
            'image' => $request->image ?? 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
            'seller_id' => $request->user()->id,
            'api_access' => true,
            'date_added' => now(),
            'status' => 'pending',
            'rating' => 0,
            'reviews' => 0,
            'sales' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agent submitted for review',
            'data' => $agent,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $agent = Agent::with('seller')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'description' => $agent->description,
                'longDescription' => $agent->long_description,
                'price' => (float) $agent->price,
                'category' => $agent->category,
                'rating' => (float) $agent->rating,
                'reviews' => $agent->reviews,
                'image' => $agent->image,
                'seller' => [
                    'id' => $agent->seller->id,
                    'name' => $agent->seller->name,
                    'verified' => $agent->seller->verified,
                ],
                'capabilities' => $agent->capabilities ?? [],
                'apiAccess' => $agent->api_access,
                'model' => $agent->model,
                'responseTime' => $agent->response_time,
                'languages' => $agent->languages ?? [],
                'tags' => $agent->tags ?? [],
                'dateAdded' => $agent->date_added->format('Y-m-d'),
                'sales' => $agent->sales,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $agent = Agent::findOrFail($id);

        // Only seller or admin can update
        if ($agent->seller_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string|max:255',
            'longDescription' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:active,pending,inactive',
        ]);

        $agent->update($request->only([
            'name', 'description', 'long_description', 'price', 'category', 'status'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Agent updated successfully',
            'data' => $agent,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $agent = Agent::findOrFail($id);

        // Only seller or admin can delete
        if ($agent->seller_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $agent->delete();

        return response()->json([
            'success' => true,
            'message' => 'Agent deleted successfully',
        ]);
    }

    /**
     * Get user's listings (for vendors)
     */
    public function myListings(Request $request)
    {
        $agents = Agent::where('seller_id', $request->user()->id)
            ->with('seller')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $agents,
        ]);
    }
}
