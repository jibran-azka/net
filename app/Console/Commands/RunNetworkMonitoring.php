<?php
namespace App\Console\Commands;
use App\Models\MonitoringConfig;
use App\Services\DeviceMonitoringService;
use Illuminate\Console\Command;
class RunNetworkMonitoring extends Command {
    protected $signature = 'monitoring:run'; protected $description = 'Run due ICMP monitoring checks.';
    public function handle(DeviceMonitoringService $monitor): int {
        MonitoringConfig::query()->where('enabled', true)->with('device.ipAddresses')->get()->each(function ($config) use ($monitor) { if (! $config->last_checked_at || $config->last_checked_at->addSeconds($config->interval_seconds)->lte(now())) $monitor->check($config->device, $config); }); return self::SUCCESS;
    }
}
