<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\Device;
use App\Models\User;
use App\Notifications\DeviceOfflineNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_notifications_are_visible_only_to_their_owner_and_can_be_filtered(): void
    {
        [$owner, $alert] = $this->offlineAlert();
        $owner->notify(new DeviceOfflineNotification($alert));
        $other = User::factory()->create();

        $this->actingAs($owner)
            ->get(route('notifications.index', ['filter' => 'unread']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Notifications/Index')
                ->where('filter', 'unread')
                ->where('notifications.total', 1)
                ->where('notifications.data.0.alert_id', $alert->id));

        $this->actingAs($other)
            ->get(route('notifications.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('notifications.total', 0));
    }

    public function test_a_user_can_only_mark_own_notifications_as_read(): void
    {
        [$owner, $alert] = $this->offlineAlert();
        $owner->notify(new DeviceOfflineNotification($alert));
        $notification = $owner->notifications()->sole();
        $other = User::factory()->create();

        $this->actingAs($other)
            ->patch(route('notifications.read', $notification->id))
            ->assertNotFound();

        $this->actingAs($owner)
            ->patch(route('notifications.read', $notification->id))
            ->assertRedirect(route('alerts.index', ['alert' => $alert->id]));

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_mark_all_as_read_only_updates_the_authenticated_users_notifications(): void
    {
        [$owner, $alert] = $this->offlineAlert();
        $owner->notify(new DeviceOfflineNotification($alert));
        [$other, $otherAlert] = $this->offlineAlert();
        $other->notify(new DeviceOfflineNotification($otherAlert));

        $this->actingAs($owner)->patch(route('notifications.read-all'))->assertRedirect();

        $this->assertNotNull($owner->notifications()->sole()->read_at);
        $this->assertNull($other->notifications()->sole()->read_at);
    }

    private function offlineAlert(): array
    {
        $user = User::factory()->create();
        $device = Device::factory()->create(['user_id' => $user->id]);
        $alert = Alert::create([
            'user_id' => $user->id,
            'device_id' => $device->id,
            'alert_type' => 'device_offline',
            'severity' => 'critical',
            'title' => "Device offline: {$device->name}",
            'message' => "Device {$device->name} (192.0.2.1) changed from Online to Offline.",
            'status' => 'active',
            'triggered_at' => now(),
        ]);

        return [$user, $alert];
    }
}
