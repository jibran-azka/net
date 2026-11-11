<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeviceInterfaceController extends Controller
{
    public function store(Request $request, Device $device)
    {
        $this->ensureOwner($device);
        $device->interfaces()->create($this->validated($request, $device));

        return back()->with('success', 'Interface berhasil ditambahkan.');
    }

    public function update(Request $request, Device $device, DeviceInterface $interface)
    {
        $this->ensureOwner($device);
        $this->ensureBelongsToDevice($device, $interface);
        $interface->update($this->validated($request, $device, $interface));

        return back()->with('success', 'Interface berhasil diperbarui.');
    }

    public function destroy(Device $device, DeviceInterface $interface)
    {
        $this->ensureOwner($device);
        $this->ensureBelongsToDevice($device, $interface);
        $interface->delete();

        return back()->with('success', 'Interface berhasil dihapus.');
    }

    private function validated(Request $request, Device $device, ?DeviceInterface $interface = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('device_interfaces', 'name')->where('device_id', $device->id)->ignore($interface?->id)],
            'mac_address' => ['nullable', 'regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function ensureOwner(Device $device): void
    {
        abort_unless((int) $device->user_id === (int) auth()->id(), 404);
    }

    private function ensureBelongsToDevice(Device $device, DeviceInterface $interface): void
    {
        abort_unless((int) $interface->device_id === (int) $device->id, 404);
    }
}
