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

    protected static function booted(): void
    {
        // SQL Server menolak dua jalur cascade menuju device_links, jadi link
        // yang memakai interface perangkat ini dihapus lebih dulu di aplikasi.
        static::deleting(function (Device $device) {
            $interfaceIds = $device->interfaces()->pluck('id');

            if ($interfaceIds->isNotEmpty()) {
                DeviceLink::whereIn('source_interface_id', $interfaceIds)
                    ->orWhereIn('target_interface_id', $interfaceIds)
                    ->delete();
            }

            $device->topologyPositions()->delete();
        });
    }

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

    public function topologyPositions(): HasMany
    {
        return $this->hasMany(TopologyPosition::class);
    }

    public function monitoringConfig(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MonitoringConfig::class);
    }

    public function monitoringResults(): HasMany
    {
        return $this->hasMany(MonitoringResult::class);
    }
}
