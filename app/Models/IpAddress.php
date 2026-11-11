<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpAddress extends Model
{
    protected $fillable = [
        'address',
        'subnet_mask',
        'gateway',
        'role',
        'is_primary',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
