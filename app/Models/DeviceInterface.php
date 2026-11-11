<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceInterface extends Model
{
    protected $fillable = [
        'name',
        'mac_address',
        'description',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
