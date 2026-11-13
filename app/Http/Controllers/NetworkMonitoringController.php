<?php
namespace App\Http\Controllers;
use App\Models\Device;
use Illuminate\Http\Request;
use Inertia\Inertia;
class NetworkMonitoringController extends Controller {
    public function index(Request $request) {
        $devices = Device::where('user_id', $request->user()->id)->with(['ipAddresses' => fn ($q) => $q->where('is_primary', true), 'monitoringConfig', 'monitoringResults' => fn ($q) => $q->latest('checked_at')->limit(1)])->orderBy('name')->get();
        $enabled = $devices->filter(fn ($d) => $d->monitoringConfig?->enabled); $latest = $enabled->map(fn ($d) => $d->monitoringResults->first());
        $chartResults = \App\Models\MonitoringResult::query()
            ->whereIn('device_id', $enabled->pluck('id'))
            ->latest('checked_at')->limit(24)->get()->reverse()->values();
        return Inertia::render('Monitoring/Index', ['devices' => $devices, 'summary' => ['monitored' => $enabled->count(), 'online' => $latest->where('status', 'online')->count(), 'offline' => $latest->where('status', 'offline')->count()], 'chartResults' => $chartResults]);
    }
    public function show(Request $request, Device $device) { $this->owner($request, $device); return Inertia::render('Monitoring/Show', ['device' => $device->load('ipAddresses', 'monitoringConfig'), 'results' => $device->monitoringResults()->latest('checked_at')->limit(100)->get()]); }
    public function update(Request $request, Device $device) { $this->owner($request, $device); $data = $request->validate(['enabled' => ['required', 'boolean'], 'interval_seconds' => ['required', 'integer', 'min:30', 'max:86400'], 'timeout_seconds' => ['required', 'integer', 'min:1', 'max:30'], 'packet_count' => ['required', 'integer', 'min:1', 'max:20']]); $device->monitoringConfig()->updateOrCreate([], $data); return back()->with('success', 'Monitoring configuration updated.'); }
    private function owner(Request $request, Device $device): void { abort_unless((int) $device->user_id === (int) $request->user()->id, 404); }
}
