<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceInterface;
use App\Models\DeviceLink;
use App\Models\TopologyPosition;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
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
        ], [
            'source_interface_id.required' => 'Pilih interface sumber terlebih dahulu.',
            'source_interface_id.integer' => 'Interface sumber tidak valid. Pilih interface dari daftar yang tersedia.',
            'source_interface_id.exists' => 'Interface sumber tidak ditemukan. Pastikan interface masih terdaftar pada perangkat asal.',
            'target_interface_id.required' => 'Pilih interface tujuan terlebih dahulu.',
            'target_interface_id.integer' => 'Interface tujuan tidak valid. Pilih interface dari daftar yang tersedia.',
            'target_interface_id.exists' => 'Interface tujuan tidak ditemukan. Pastikan perangkat tujuan memiliki interface.',
            'target_interface_id.different' => 'Interface sumber dan tujuan harus berbeda.',
            'connection_type.required' => 'Pilih jenis koneksi terlebih dahulu.',
            'connection_type.in' => 'Jenis koneksi tidak dikenali. Pilih Ethernet, Fiber, Wireless, Serial, atau Other.',
            'label.string' => 'Label koneksi harus berupa teks.',
            'label.max' => 'Label koneksi terlalu panjang. Maksimal 255 karakter.',
            'status.required' => 'Pilih status koneksi terlebih dahulu.',
            'status.in' => 'Status koneksi tidak valid. Pilih Active, Inactive, atau Unknown.',
            'notes.string' => 'Catatan koneksi harus berupa teks.',
        ]);
    }

    private function validateInterfaces(array $data, ?DeviceLink $ignore = null): void
    {
        $interfaces = DeviceInterface::with('device.latestMonitoringResult')->whereIn('id', [$data['source_interface_id'], $data['target_interface_id']])->get()->keyBy('id');
        if (! $interfaces->has($data['source_interface_id'])) {
            throw ValidationException::withMessages(['source_interface_id' => 'Interface sumber tidak ditemukan atau sudah dihapus dari inventory.']);
        }
        if (! $interfaces->has($data['target_interface_id'])) {
            throw ValidationException::withMessages(['target_interface_id' => 'Interface tujuan tidak ditemukan. Tambahkan interface pada perangkat tujuan terlebih dahulu.']);
        }
        if ($interfaces->contains(fn ($interface) => (int) $interface->device->user_id !== (int) auth()->id())) {
            throw ValidationException::withMessages(['target_interface_id' => 'Perangkat asal atau tujuan tidak dapat digunakan karena bukan bagian dari inventory akun ini.']);
        }
        $offline = $interfaces->filter(fn ($interface) => $interface->device->latestMonitoringResult?->status === 'offline');
        if ($offline->isNotEmpty()) {
            $names = $offline->pluck('device.name')->join(' dan ');
            throw ValidationException::withMessages(['target_interface_id' => "Perangkat {$names} sedang offline berdasarkan monitoring terakhir, sehingga koneksi belum dapat dibuat."]);
        }
        if ($interfaces[$data['source_interface_id']]->device_id === $interfaces[$data['target_interface_id']]->device_id) {
            throw ValidationException::withMessages(['target_interface_id' => 'Perangkat asal dan tujuan harus berbeda. Kamu tidak dapat menghubungkan dua interface dari perangkat yang sama.']);
        }
        $duplicate = DeviceLink::query()->where(function ($query) use ($data) {
            $query->where('source_interface_id', $data['source_interface_id'])->where('target_interface_id', $data['target_interface_id'])
                ->orWhere(fn ($query) => $query->where('source_interface_id', $data['target_interface_id'])->where('target_interface_id', $data['source_interface_id']));
        })->when($ignore, fn ($query) => $query->whereKeyNot($ignore->id))->exists();
        if ($duplicate) {
            throw ValidationException::withMessages(['target_interface_id' => 'Koneksi antara kedua interface ini sudah ada. Pilih interface lain atau ubah koneksi yang sudah tersedia.']);
        }
    }

    private function ensureLinkOwner(DeviceLink $link): void
    {
        $link->loadMissing('sourceInterface.device', 'targetInterface.device');
        abort_unless($link->sourceInterface->device->user_id === auth()->id() && $link->targetInterface->device->user_id === auth()->id(), 404);
    }
}
