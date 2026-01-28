<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Wallet extends Model
{
    protected $fillable = [
        'user_id',
        'balance',
        'currency',
        'status',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class)->orderBy('created_at', 'desc');
    }

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class);
    }

    public function pendingWithdrawals(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class)->whereIn('status', ['pending', 'approved']);
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }
}
