<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            'capabilities' => 'required|string', // JSON string from FormData
            'languages' => 'required|string', // JSON string from FormData
            'tags' => 'nullable|string', // JSON string from FormData
            'image' => 'nullable|string',
            'agent_file' => 'nullable|file|mimes:zip,rar,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/vnd.rar|max:102400', // 100MB max
            'video_file' => 'nullable|file|mimes:mp4,avi,mov,wmv,flv,webm|max:512000', // 500MB max
            'video_url' => 'nullable|url|max:500',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max per image
        ]);

        // Handle file uploads
        $filePath = null;
        if ($request->hasFile('agent_file')) {
            $file = $request->file('agent_file');
            $filePath = $file->store('agent-files', 'public');
        }

        // Handle video upload or URL
        $videoPath = null;
        $videoUrl = null;
        if ($request->hasFile('video_file')) {
            $video = $request->file('video_file');
            $videoPath = $video->store('agent-videos', 'public');
        } elseif ($request->has('video_url') && $request->video_url) {
            $videoUrl = $request->video_url;
        }

        // Handle thumbnail image
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail_image')) {
            $thumbnail = $request->file('thumbnail_image');
            $thumbnailPath = $thumbnail->store('agent-thumbnails', 'public');
        }

        // Handle gallery images
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $galleryPaths[] = $image->store('agent-gallery', 'public');
            }
        }

        // Parse JSON strings from FormData
        $capabilities = json_decode($request->capabilities, true) ?? [];
        $languages = json_decode($request->languages, true) ?? [];
        $tags = $request->has('tags') && $request->tags ? json_decode($request->tags, true) ?? [] : [];

        $agent = Agent::create([
            'name' => $request->name,
            'description' => $request->description,
            'long_description' => $request->longDescription,
            'price' => $request->price,
            'category' => $request->category,
            'model' => $request->model,
            'response_time' => $request->responseTime,
            'capabilities' => $capabilities,
            'languages' => $languages,
            'tags' => $tags,
            'image' => $request->image ?? 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
            'file_path' => $filePath,
            'video_url' => $videoUrl ?: ($videoPath ? url(Storage::url($videoPath)) : null),
            'thumbnail_image' => $thumbnailPath ? Storage::url($thumbnailPath) : null,
            'gallery_images' => !empty($galleryPaths) ? array_map(fn($path) => Storage::url($path), $galleryPaths) : null,
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
                'filePath' => $agent->file_path ? Storage::url($agent->file_path) : null,
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

    /**
     * Download agent file (for customers who purchased)
     */
    public function downloadFile(Request $request, string $id)
    {
        $agent = Agent::findOrFail($id);
        $user = $request->user();

        // Check if user purchased this agent
        $hasPurchased = $user->purchases()->where('agent_id', $agent->id)->exists();

        // Allow admin and seller to download
        $canDownload = $user->isAdmin() || 
                      $agent->seller_id === $user->id || 
                      $hasPurchased;

        if (!$canDownload) {
            return response()->json([
                'success' => false,
                'message' => 'You must purchase this agent to download the files',
            ], 403);
        }

        if (!$agent->file_path || !Storage::disk('public')->exists($agent->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return Storage::disk('public')->download($agent->file_path);
    }
}
