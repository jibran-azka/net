<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'device_type' => ['nullable', Rule::in($this->deviceTypes())],
            'lifecycle_status' => ['nullable', Rule::in($this->statuses())],
            'location' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', Rule::in(['name', 'created_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
        ]);

        $devices = Device::query()->where('user_id', auth()->id())
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    foreach (['name', 'hostname', 'vendor', 'model', 'serial_number'] as $column) {
                        $query->orWhere($column, 'like', "%{$search}%");
                    }
                });
            })
            ->when($filters['device_type'] ?? null, fn ($query, $type) => $query->where('device_type', $type))
            ->when($filters['lifecycle_status'] ?? null, fn ($query, $status) => $query->where('lifecycle_status', $status))
            ->when($filters['location'] ?? null, fn ($query, $location) => $query->where('location', 'like', "%{$location}%"))
            ->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')
            ->paginate(10);

        return Inertia::render('Devices/Index', [
            'devices' => $devices,
            'filters' => $filters,
            'deviceTypes' => $this->deviceTypes(),
            'statuses' => $this->statuses(),
            'total' => Device::where('user_id', auth()->id())->count(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Devices/Create', ['deviceTypes' => $this->deviceTypes(), 'statuses' => $this->statuses()]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        $device = Device::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return redirect()
            ->route('devices.show', $device)
            ->with('success', 'Device berhasil ditambahkan.');
    }

    public function show(Device $device)
    {
        $this->ensureOwner($device);

        $device->load([
            'ipAddresses',
            'interfaces',
        ]);

        return Inertia::render('Devices/Show', [
            'device' => $device,
        ]);
    }

    public function edit(Device $device)
    {
        $this->ensureOwner($device);

        return Inertia::render('Devices/Edit', ['device' => $device, 'deviceTypes' => $this->deviceTypes(), 'statuses' => $this->statuses()]);
    }

    public function update(Request $request, Device $device)
    {
        $this->ensureOwner($device);
        $device->update($this->validated($request));

        return redirect()->route('devices.show', $device)->with('success', 'Device berhasil diperbarui.');
    }

    public function destroy(Device $device)
    {
        $this->ensureOwner($device);
        DB::transaction(function () use ($device) {
            $interfaceIds = $device->interfaces()->pluck('id');
            DeviceLink::whereIn('source_interface_id', $interfaceIds)->orWhereIn('target_interface_id', $interfaceIds)->delete();
            $device->delete();
        });

        return redirect()->route('devices.index')->with('success', 'Device berhasil dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'], 'hostname' => ['nullable', 'string', 'max:255'],
            'device_type' => ['required', Rule::in($this->deviceTypes())], 'vendor' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'], 'serial_number' => ['nullable', 'string', 'max:255'],
            'mac_address' => ['nullable', 'regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/'], 'location' => ['nullable', 'string', 'max:255'],
            'lifecycle_status' => ['required', Rule::in($this->statuses())], 'description' => ['nullable', 'string'],
        ]);
    }

    private function ensureOwner(Device $device): void
    {
        abort_unless((int) $device->user_id === (int) auth()->id(), 404);
    }

    private function deviceTypes(): array
    {
        return ['router', 'switch', 'server', 'firewall', 'access_point', 'wireless_controller', 'modem', 'load_balancer', 'other'];
    }

    private function statuses(): array
    {
        return ['active', 'inactive', 'maintenance', 'retired'];
    }
}
