<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeviceInterface extends Model
{
    protected $fillable = [
        'device_id',
        'name',
        'mac_address',
        'description',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function sourceLinks(): HasMany
    {
        return $this->hasMany(DeviceLink::class, 'source_interface_id');
    }

    public function targetLinks(): HasMany
    {
        return $this->hasMany(DeviceLink::class, 'target_interface_id');
    }
}
