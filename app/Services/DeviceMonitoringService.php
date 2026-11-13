<?php
namespace App\Services;
use App\Models\Device;
use App\Models\MonitoringConfig;
use Illuminate\Support\Facades\Cache;
class DeviceMonitoringService {
    public function __construct(private IcmpPingService $ping) {}
    public function check(Device $device, MonitoringConfig $config): bool {
        $lock = Cache::lock('monitor-device-'.$device->id, 60);
        if (! $lock->get()) return false;
        try { $result = $this->ping->check($device, $config->timeout_seconds, $config->packet_count); $device->monitoringResults()->create($result); $config->update(['last_checked_at' => now()]); return true; } finally { $lock->release(); }
    }
}
