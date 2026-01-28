<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
            'role' => 'nullable|in:admin,vendor,customer',
        ], [
            'password.min' => 'Password must be at least 8 characters long.',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'customer',
            'verified' => false,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'verified' => $user->verified,
                'avatar' => $user->avatar ? url(Storage::url($user->avatar)) : null,
            ],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'verified' => $user->verified,
                'avatar' => $user->avatar ? url(Storage::url($user->avatar)) : null,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $avatarUrl = $user->avatar ? url(Storage::url($user->avatar)) : null;
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'verified' => $user->verified,
                'avatar' => $avatarUrl,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $request->user()->id,
            'avatar' => 'sometimes|nullable|string|max:500',
        ]);

        $user = $request->user();
        
        // Prepare update data - always update name and email if provided
        $updateData = [];
        
        if ($request->has('name') && $request->filled('name')) {
            $updateData['name'] = $request->name;
        }
        
        if ($request->has('email') && $request->filled('email')) {
            $updateData['email'] = $request->email;
        }
        
        // Handle avatar - convert URL to path if needed
        if ($request->has('avatar')) {
            $avatar = $request->avatar;
            
            if (empty($avatar) || $avatar === null) {
                $updateData['avatar'] = null;
            } else {
                // If avatar is a full URL, extract the path
                if (strpos($avatar, '/storage/') !== false) {
                    // Extract path from URL (e.g., /storage/avatars/file.jpg -> avatars/file.jpg)
                    $path = parse_url($avatar, PHP_URL_PATH);
                    $updateData['avatar'] = str_replace('/storage/', '', $path);
                } elseif (strpos($avatar, 'storage/') === 0) {
                    // Already has storage/ prefix, remove it
                    $updateData['avatar'] = str_replace('storage/', '', $avatar);
                } elseif (strpos($avatar, 'avatars/') === 0) {
                    // Already a path like "avatars/file.jpg"
                    $updateData['avatar'] = $avatar;
                } else {
                    // Try to extract path from full URL
                    $parsed = parse_url($avatar);
                    if (isset($parsed['path'])) {
                        $path = ltrim($parsed['path'], '/');
                        if (strpos($path, 'storage/') === 0) {
                            $updateData['avatar'] = str_replace('storage/', '', $path);
                        } elseif (strpos($path, 'avatars/') === 0) {
                            $updateData['avatar'] = $path;
                        } else {
                            // Assume it's already a valid path
                            $updateData['avatar'] = $avatar;
                        }
                    } else {
                        // Fallback: assume it's already a valid path
                        $updateData['avatar'] = $avatar;
                    }
                }
            }
        }
        
        // Only update if there's data to update
        if (!empty($updateData)) {
            $user->update($updateData);
            $user->refresh();
        }
        
        // Return avatar as full URL
        $avatarUrl = $user->avatar ? url(Storage::url($user->avatar)) : null;

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'verified' => $user->verified,
                'avatar' => $avatarUrl,
            ],
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        $user = $request->user();
        
        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        
        // Update user avatar
        $user->update(['avatar' => $path]);

        return response()->json([
            'success' => true,
            'avatar' => url(Storage::url($path)),
            'message' => 'Avatar uploaded successfully',
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/|confirmed',
        ], [
            'new_password.min' => 'Password must be at least 8 characters long.',
            'new_password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            'new_password.confirmed' => 'The new password confirmation does not match.',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }
}
