<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $userId = (int) $request->user()->id;
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:255'], 'status' => ['nullable', 'in:active,acknowledged,resolved'], 'device_id' => ['nullable', 'integer'], 'alert' => ['nullable', 'integer']]);
        $alerts = Alert::forUser($userId)->with(['device' => fn ($q) => $q->with(['ipAddresses' => fn ($ip) => $ip->where('is_primary', true)])])
            ->when($filters['search'] ?? null, function ($q, $search) { $q->where(function ($inner) use ($search) { $inner->whereHas('device', fn ($device) => $device->where('name', 'like', "%{$search}%"))->orWhereHas('device.ipAddresses', fn ($ip) => $ip->where('address', 'like', "%{$search}%")); }); })
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))->when($filters['device_id'] ?? null, fn ($q, $deviceId) => $q->where('device_id', $deviceId))->latest('triggered_at')->paginate(10)->withQueryString();
        $counts = Alert::forUser($userId)->selectRaw("SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status = 'acknowledged' THEN 1 ELSE 0 END) as acknowledged, SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved")->first();
        $focus = ($filters['alert'] ?? null) ? Alert::forUser($userId)->with(['device' => fn ($q) => $q->with(['ipAddresses' => fn ($ip) => $ip->where('is_primary', true)])])->find($filters['alert']) : null;
        return Inertia::render('Alerts/Index', ['alerts' => $alerts, 'summary' => ['active' => (int) ($counts->active ?? 0), 'acknowledged' => (int) ($counts->acknowledged ?? 0), 'resolved' => (int) ($counts->resolved ?? 0)], 'devices' => Device::where('user_id', $userId)->orderBy('name')->get(['id', 'name']), 'filters' => $filters, 'focusAlert' => $focus]);
    }

    public function acknowledge(Request $request, Alert $alert)
    {
        $this->owner($request, $alert); abort_unless($alert->status === 'active', 422, 'Only active alerts can be acknowledged.');
        $alert->update(['status' => 'acknowledged', 'acknowledged_at' => now()]); return back()->with('success', 'Alert acknowledged.');
    }

    public function resolve(Request $request, Alert $alert)
    {
        $this->owner($request, $alert); abort_unless(in_array($alert->status, ['active', 'acknowledged'], true), 422, 'Only active or acknowledged alerts can be resolved.');
        DB::transaction(fn () => $alert->update(['status' => 'resolved', 'resolved_at' => now()])); return back()->with('success', 'Alert resolved.');
    }

    private function owner(Request $request, Alert $alert): void { abort_unless((int) $alert->user_id === (int) $request->user()->id, 404); }
}
