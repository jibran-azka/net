<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceInterface;
use App\Models\DeviceLink;
use App\Models\TopologyPosition;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class NetworkTopologyController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $devices = Device::query()->where('user_id', $userId)->with([
            'ipAddresses',
            'interfaces',
            'topologyPositions' => fn ($query) => $query->where('user_id', $userId),
        ])->orderBy('name')->get();
        $links = DeviceLink::query()->with(['sourceInterface.device', 'targetInterface.device'])
            ->whereHas('sourceInterface.device', fn ($query) => $query->where('user_id', $userId))
            ->whereHas('targetInterface.device', fn ($query) => $query->where('user_id', $userId))
            ->get();

        return Inertia::render('Topology/Index', compact('devices', 'links'));
    }

    public function storeLink(Request $request)
    {
        $data = $this->validatedLink($request);
        $this->validateInterfaces($data);
        DeviceLink::create($data);

        return back()->with('success', 'Koneksi berhasil dibuat.');
    }

    public function updateLink(Request $request, DeviceLink $link)
    {
        $this->ensureLinkOwner($link);
        $data = $this->validatedLink($request);
        $this->validateInterfaces($data, $link);
        $link->update($data);

        return back()->with('success', 'Koneksi berhasil diperbarui.');
    }

    public function destroyLink(DeviceLink $link)
    {
        $this->ensureLinkOwner($link);
        $link->delete();

        return back()->with('success', 'Koneksi berhasil dihapus.');
    }

    public function savePosition(Request $request)
    {
        $data = $request->validate(['device_id' => ['required', 'integer'], 'position_x' => ['required', 'numeric'], 'position_y' => ['required', 'numeric']]);
        $device = Device::where('user_id', $request->user()->id)->findOrFail($data['device_id']);
        TopologyPosition::updateOrCreate(['user_id' => $request->user()->id, 'device_id' => $device->id], ['position_x' => $data['position_x'], 'position_y' => $data['position_y']]);

        return response()->noContent();
    }

    private function validatedLink(Request $request): array
    {
        return $request->validate([
            'source_interface_id' => ['required', 'integer', 'exists:device_interfaces,id'],
            'target_interface_id' => ['required', 'integer', 'exists:device_interfaces,id', 'different:source_interface_id'],
            'connection_type' => ['required', Rule::in(['ethernet', 'fiber', 'wireless', 'serial', 'other'])],
            'label' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['active', 'inactive', 'unknown'])],
            'notes' => ['nullable', 'string'],
        ]);
    }

    private function validateInterfaces(array $data, ?DeviceLink $ignore = null): void
    {
        $interfaces = DeviceInterface::with('device')->whereIn('id', [$data['source_interface_id'], $data['target_interface_id']])->get()->keyBy('id');
        abort_unless($interfaces->count() === 2 && $interfaces->every(fn ($interface) => $interface->device->user_id === auth()->id()), 404);
        if ($interfaces[$data['source_interface_id']]->device_id === $interfaces[$data['target_interface_id']]->device_id) {
            abort(422, 'Interfaces must belong to different devices.');
        }
        $duplicate = DeviceLink::query()->where(function ($query) use ($data) {
            $query->where('source_interface_id', $data['source_interface_id'])->where('target_interface_id', $data['target_interface_id'])
                ->orWhere(fn ($query) => $query->where('source_interface_id', $data['target_interface_id'])->where('target_interface_id', $data['source_interface_id']));
        })->when($ignore, fn ($query) => $query->whereKeyNot($ignore->id))->exists();
        if ($duplicate) {
            abort(422, 'Connection already exists.');
        }
    }

    private function ensureLinkOwner(DeviceLink $link): void
    {
        $link->loadMissing('sourceInterface.device', 'targetInterface.device');
        abort_unless($link->sourceInterface->device->user_id === auth()->id() && $link->targetInterface->device->user_id === auth()->id(), 404);
    }
}
