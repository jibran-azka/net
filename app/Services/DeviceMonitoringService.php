<?php
namespace App\Services;
use App\Models\Device;
use App\Models\MonitoringConfig;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DeviceMonitoringService {
    public function __construct(private IcmpPingService $ping, private DeviceAlertService $alerts) {}
    public function check(Device $device, MonitoringConfig $config): bool {
        $lock = Cache::lock('monitor-device-'.$device->id, 60);
        if (! $lock->get()) return false;
        try {
            $pingResult = $this->ping->check($device, $config->timeout_seconds, $config->packet_count);
            DB::transaction(function () use ($device, $config, $pingResult): void {
                $lockedDevice = Device::query()->whereKey($device->id)->lockForUpdate()->firstOrFail();
                $lockedDevice->loadMissing('ipAddresses');
                $previous = $lockedDevice->monitoringResults()->latest('checked_at')->first();
                $result = $lockedDevice->monitoringResults()->create($pingResult);
                $this->alerts->sync($lockedDevice, $result, $previous);
                $config->update(['last_checked_at' => now()]);
            });
            return true;
        } finally { $lock->release(); }
    }
}
