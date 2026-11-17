<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    protected $fillable = [
        'user_id',
        'device_id',
        'alert_type',
        'severity',
        'title',
        'message',
        'status',
        'triggered_at',
        'acknowledged_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'triggered_at' => 'datetime',
            'acknowledged_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereIn('status', ['active', 'acknowledged']);
    }
}


