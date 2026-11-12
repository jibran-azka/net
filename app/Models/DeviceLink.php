<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceLink extends Model
{
    protected $fillable = ['source_interface_id', 'target_interface_id', 'connection_type', 'label', 'status', 'notes'];

    public function sourceInterface(): BelongsTo
    {
        return $this->belongsTo(DeviceInterface::class, 'source_interface_id');
    }

    public function targetInterface(): BelongsTo
    {
        return $this->belongsTo(DeviceInterface::class, 'target_interface_id');
    }
}
