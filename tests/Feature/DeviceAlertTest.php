<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\Device;
use App\Models\MonitoringConfig;
use App\Models\User;
use App\Services\DeviceAlertService;
use App\Services\DeviceMonitoringService;
use App\Services\IcmpPingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class DeviceAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_online_to_offline_creates_one_critical_alert_and_repeated_offline_checks_do_not_duplicate(): void
    {
        [$device, $config] = $this->monitoredDevice();
        $ping = Mockery::mock(IcmpPingService::class);
        $ping->shouldReceive('check')->once()->andReturn($this->pingResult('online'));
        $ping->shouldReceive('check')->twice()->andReturn($this->pingResult('offline'));

        $monitor = new DeviceMonitoringService($ping, new DeviceAlertService());
        $monitor->check($device, $config);
        $monitor->check($device, $config);
        $monitor->check($device, $config);

        $this->assertDatabaseCount('alerts', 1);
        $this->assertDatabaseHas('alerts', ['device_id' => $device->id, 'status' => 'active', 'severity' => 'critical', 'alert_type' => 'device_offline']);
    }

    public function test_recovery_resolves_the_active_alert_and_a_later_outage_creates_a_new_alert(): void
    {
        [$device, $config] = $this->monitoredDevice();
        $ping = Mockery::mock(IcmpPingService::class);
        $ping->shouldReceive('check')->andReturn($this->pingResult('online'), $this->pingResult('offline'), $this->pingResult('online'), $this->pingResult('offline'));

        $monitor = new DeviceMonitoringService($ping, new DeviceAlertService());
        for ($i = 0; $i < 4; $i++) {
            $monitor->check($device, $config);
        }

        $this->assertDatabaseCount('alerts', 2);
        $this->assertDatabaseHas('alerts', ['device_id' => $device->id, 'status' => 'resolved']);
        $this->assertDatabaseHas('alerts', ['device_id' => $device->id, 'status' => 'active']);
    }

    public function test_alerts_are_scoped_to_the_device_owner(): void
    {
        [$device] = $this->monitoredDevice();
        $other = User::factory()->create();
        Alert::create(['user_id' => $device->user_id, 'device_id' => $device->id, 'alert_type' => 'device_offline', 'severity' => 'critical', 'title' => 'Device offline', 'message' => 'Offline', 'status' => 'active', 'triggered_at' => now()]);

        $this->assertCount(1, $device->user->alerts()->get());
        $this->assertCount(0, $other->alerts()->get());
    }

    private function monitoredDevice(): array
    {
        $user = User::factory()->create();
        $device = Device::factory()->create(['user_id' => $user->id]);
        $config = $device->monitoringConfig()->create(['enabled' => true, 'interval_seconds' => 60, 'timeout_seconds' => 2, 'packet_count' => 4]);

        return [$device, $config];
    }

    private function pingResult(string $status): array
    {
        return ['status' => $status, 'latency' => $status === 'online' ? 4.2 : null, 'packet_loss' => $status === 'online' ? 0 : 100, 'packets_sent' => 4, 'packets_received' => $status === 'online' ? 4 : 0, 'error_message' => $status === 'online' ? null : 'No ICMP reply received.', 'checked_at' => now()];
    }
}

