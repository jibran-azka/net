<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\IpAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class IpAddressController extends Controller
{
    public function store(Request $request, Device $device)
    {
        $this->ensureOwner($device);
        $data = $this->validated($request, $device);

        DB::transaction(function () use ($device, $data): void {
            if ($data['is_primary']) {
                $device->ipAddresses()->update(['is_primary' => false]);
            }
            $device->ipAddresses()->create($data);
        });

        return back()->with('success', 'IP address berhasil ditambahkan.');
    }

    public function update(Request $request, Device $device, IpAddress $ipAddress)
    {
        $this->ensureOwner($device);
        $this->ensureBelongsToDevice($device, $ipAddress);
        $data = $this->validated($request, $device, $ipAddress);

        DB::transaction(function () use ($device, $ipAddress, $data): void {
            if ($data['is_primary']) {
                $device->ipAddresses()->whereKeyNot($ipAddress->id)->update(['is_primary' => false]);
            }
            $ipAddress->update($data);
        });

        return back()->with('success', 'IP address berhasil diperbarui.');
    }

    public function destroy(Device $device, IpAddress $ipAddress)
    {
        $this->ensureOwner($device);
        $this->ensureBelongsToDevice($device, $ipAddress);
        $ipAddress->delete();

        return back()->with('success', 'IP address berhasil dihapus.');
    }

    public function setPrimary(Device $device, IpAddress $ipAddress)
    {
        $this->ensureOwner($device);
        $this->ensureBelongsToDevice($device, $ipAddress);

        DB::transaction(function () use ($device, $ipAddress): void {
            $device->ipAddresses()->update(['is_primary' => false]);
            $ipAddress->update(['is_primary' => true]);
        });

        return back()->with('success', 'IP utama berhasil diatur.');
    }

    private function validated(Request $request, Device $device, ?IpAddress $ipAddress = null): array
    {
        return $request->validate([
            'address' => ['required', 'ip', 'max:45', Rule::unique('ip_addresses', 'address')->where('device_id', $device->id)->ignore($ipAddress?->id)],
            'subnet_mask' => ['nullable', 'string', 'max:45', 'regex:/^(\/([0-9]|[1-9][0-9]|1[01][0-9]|12[0-8])|((25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2}))$/'],
            'gateway' => ['nullable', 'ip', 'max:45'],
            'role' => ['required', Rule::in(['management', 'lan', 'wan', 'loopback', 'service', 'other'])],
            'is_primary' => ['required', 'boolean'],
        ]);
    }

    private function ensureOwner(Device $device): void
    {
        abort_unless((int) $device->user_id === (int) auth()->id(), 404);
    }

    private function ensureBelongsToDevice(Device $device, IpAddress $ipAddress): void
    {
        abort_unless((int) $ipAddress->device_id === (int) $device->id, 404);
    }
}
