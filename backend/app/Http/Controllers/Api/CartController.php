<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function index(Request $request)
    {
        $cartItems = CartItem::where('user_id', $request->user()->id)
            ->with('agent.seller')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cartItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'agent' => [
                        'id' => $item->agent->id,
                        'name' => $item->agent->name,
                        'description' => $item->agent->description,
                        'price' => (float) $item->agent->price,
                        'image' => $item->agent->image,
                        'seller' => [
                            'id' => $item->agent->seller->id,
                            'name' => $item->agent->seller->name,
                            'verified' => $item->agent->seller->verified,
                        ],
                    ],
                    'quantity' => $item->quantity,
                ];
            }),
        ]);
    }

    /**
     * Add item to cart
     */
    public function store(Request $request)
    {
        $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'quantity' => 'sometimes|integer|min:1',
        ]);

        $cartItem = CartItem::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'agent_id' => $request->agent_id,
            ],
            [
                'quantity' => $request->quantity ?? 1,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'data' => $cartItem->load('agent.seller'),
        ], 201);
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $cartItem->update([
            'quantity' => $request->quantity,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'data' => $cartItem->load('agent.seller'),
        ]);
    }

    /**
     * Remove item from cart
     */
    public function destroy(Request $request, string $id)
    {
        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
        ]);
    }

    /**
     * Clear entire cart
     */
    public function clear(Request $request)
    {
        CartItem::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
        ]);
    }
}
