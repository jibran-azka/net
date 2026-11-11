<?php

namespace Tests\Feature\Devices;

use App\Models\Device;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceInventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_and_view_only_their_devices(): void
    {
        $user = User::factory()->create();
        $otherDevice = Device::factory()->for(User::factory())->create();

        $this->actingAs($user)->post(route('devices.store'), [
            'name' => 'Core Switch', 'device_type' => 'switch', 'lifecycle_status' => 'active',
        ])->assertRedirect();

        $this->assertDatabaseHas('devices', ['name' => 'Core Switch', 'user_id' => $user->id]);
        $this->actingAs($user)->get(route('devices.show', $otherDevice))->assertNotFound();
    }

    public function test_ip_addresses_are_unique_per_device_and_primary_is_consistent(): void
    {
        $user = User::factory()->create();
        $device = Device::factory()->for($user)->create();
        $this->actingAs($user)->post(route('devices.ip-addresses.store', $device), ['address' => '10.0.0.1', 'role' => 'management', 'is_primary' => true])->assertSessionHasNoErrors();
        $this->actingAs($user)->post(route('devices.ip-addresses.store', $device), ['address' => '10.0.0.2', 'role' => 'lan', 'is_primary' => true])->assertSessionHasNoErrors();
        $this->assertDatabaseCount('ip_addresses', 2);
        $this->assertDatabaseHas('ip_addresses', ['device_id' => $device->id, 'address' => '10.0.0.1', 'is_primary' => false]);
        $this->assertSame(1, $device->ipAddresses()->where('is_primary', true)->count());
        $this->actingAs($user)->post(route('devices.ip-addresses.store', $device), ['address' => '10.0.0.2', 'role' => 'lan', 'is_primary' => false])->assertSessionHasErrors('address');
    }
}
