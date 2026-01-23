<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agent extends Model
{
    protected $fillable = [
        'name',
        'description',
        'long_description',
        'price',
        'category',
        'rating',
        'reviews',
        'image',
        'seller_id',
        'capabilities',
        'api_access',
        'model',
        'response_time',
        'languages',
        'tags',
        'date_added',
        'sales',
        'status',
    ];

    protected $casts = [
        'capabilities' => 'array',
        'languages' => 'array',
        'tags' => 'array',
        'price' => 'decimal:2',
        'rating' => 'decimal:2',
        'api_access' => 'boolean',
        'date_added' => 'date',
    ];

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }
}
