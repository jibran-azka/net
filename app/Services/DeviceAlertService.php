<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\Device;
use App\Models\MonitoringResult;
use App\Notifications\DeviceOfflineNotification;

class DeviceAlertService
{
    public function sync(Device $device, MonitoringResult $result, ?MonitoringResult $previous): void
    {
        if ($result->status === 'online') {
            Alert::query()
                ->forUser((int) $device->user_id)
                ->where('device_id', $device->id)
                ->where('alert_type', 'device_offline')
                ->open()
                ->update([
                    'status' => 'resolved',
                    'resolved_at' => $result->checked_at,
                    'updated_at' => now(),
                ]);

            return;
        }

        // The first offline check has no Online -> Offline transition. The
        // monitoring result documents the initial state; an alert starts only
        // after a confirmed online state has gone offline.
        if ($result->status !== 'offline' || $previous?->status !== 'online') {
            return;
        }

        if (Alert::query()
            ->forUser((int) $device->user_id)
            ->where('device_id', $device->id)
            ->where('alert_type', 'device_offline')
            ->open()
            ->exists()) {
            return;
        }

        $ipAddress = $device->ipAddresses->firstWhere('is_primary', true)?->address
            ?? $device->ipAddresses->first()?->address
            ?? 'No IP address recorded';

        $alert = Alert::create([
            'user_id' => $device->user_id,
            'device_id' => $device->id,
            'alert_type' => 'device_offline',
            'severity' => 'critical',
            'title' => "Device offline: {$device->name}",
            'message' => "Device {$device->name} ({$ipAddress}) changed from Online to Offline. No ICMP reply was received.",
            'status' => 'active',
            'triggered_at' => $result->checked_at,
        ]);
        $alert->loadMissing('device');
        $device->user->notify(new DeviceOfflineNotification($alert));
    }
}


