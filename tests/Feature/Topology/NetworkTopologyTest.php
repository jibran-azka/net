<?php

namespace Tests\Feature\Topology;

use App\Models\Device;
use App\Models\DeviceInterface;
use App\Models\DeviceLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NetworkTopologyTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_only_their_topology_and_save_position(): void
    {
        $user = User::factory()->create();
        $device = Device::factory()->for($user)->create();
        Device::factory()->for(User::factory())->create();

        $this->actingAs($user)->get(route('topology.index'))->assertOk()->assertInertia(fn ($page) => $page->has('devices', 1));
        $this->actingAs($user)->put(route('topology.positions.save'), ['device_id' => $device->id, 'position_x' => 125.5, 'position_y' => 240])->assertNoContent();
        $this->assertDatabaseHas('topology_positions', ['user_id' => $user->id, 'device_id' => $device->id]);
    }

    public function test_links_require_owned_interfaces_on_different_devices_and_cannot_be_duplicates(): void
    {
        $user = User::factory()->create();
        $first = Device::factory()->for($user)->create();
        $second = Device::factory()->for($user)->create();
        $a = DeviceInterface::create(['device_id' => $first->id, 'name' => 'Gi0/1']);
        $b = DeviceInterface::create(['device_id' => $second->id, 'name' => 'Gi0/1']);
        $foreign = DeviceInterface::create(['device_id' => Device::factory()->for(User::factory())->create()->id, 'name' => 'eth0']);
        $payload = ['source_interface_id' => $a->id, 'target_interface_id' => $b->id, 'connection_type' => 'ethernet', 'status' => 'active'];

        $this->actingAs($user)->post(route('topology.links.store'), $payload)->assertSessionHasNoErrors();
        $this->assertDatabaseCount('device_links', 1);
        $this->actingAs($user)->post(route('topology.links.store'), [...$payload, 'source_interface_id' => $b->id, 'target_interface_id' => $a->id])->assertStatus(422);
        $this->actingAs($user)->post(route('topology.links.store'), [...$payload, 'target_interface_id' => $foreign->id])->assertNotFound();
        $this->actingAs($user)->post(route('topology.links.store'), [...$payload, 'target_interface_id' => $a->id])->assertSessionHasErrors('target_interface_id');
    }

    public function test_link_owner_can_update_and_delete_link(): void
    {
        $user = User::factory()->create();
        $devices = Device::factory()->count(2)->for($user)->create();
        $a = DeviceInterface::create(['device_id' => $devices[0]->id, 'name' => 'A']);
        $b = DeviceInterface::create(['device_id' => $devices[1]->id, 'name' => 'B']);
        $link = DeviceLink::create(['source_interface_id' => $a->id, 'target_interface_id' => $b->id, 'connection_type' => 'ethernet', 'status' => 'active']);
        $data = ['source_interface_id' => $a->id, 'target_interface_id' => $b->id, 'connection_type' => 'fiber', 'status' => 'inactive', 'label' => 'Uplink'];

        $this->actingAs($user)->put(route('topology.links.update', $link), $data)->assertSessionHasNoErrors();
        $this->assertDatabaseHas('device_links', ['id' => $link->id, 'connection_type' => 'fiber']);
        $this->actingAs($user)->delete(route('topology.links.destroy', $link))->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('device_links', ['id' => $link->id]);
    }
}
