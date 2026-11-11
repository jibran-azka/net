<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'hostname',
        'device_type',
        'vendor',
        'model',
        'serial_number',
        'mac_address',
        'location',
        'lifecycle_status',
        'description',
    ];

    public function ipAddresses(): HasMany
    {
        return $this->hasMany(IpAddress::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interfaces(): HasMany
    {
        return $this->hasMany(DeviceInterface::class);
    }
}
