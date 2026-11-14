<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\MonitoringResult;
use App\Models\TeamInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $period = $request->validate([
            'period' => ['nullable', 'in:1h,24h,7d,30d'],
            'activity_page' => ['nullable', 'integer', 'min:1'],
        ])['period'] ?? '24h';
        $activityPage = (int) ($request->input('activity_page', 1));
        $from = match ($period) {
            '1h' => now()->subHour(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            default => now()->subDay(),
        };
        $deviceQuery = Device::query()->where('user_id', $request->user()->id);
        $devices = (clone $deviceQuery)
            ->with('latestMonitoringResult:id,device_id,status,latency,packet_loss,checked_at')
            ->orderBy('name')
            ->get(['id', 'name', 'device_type']);
        $latestResults = $devices->pluck('latestMonitoringResult')->filter();
        $resultQuery = MonitoringResult::query()
            ->whereIn('device_id', (clone $deviceQuery)->select('id'));
        $periodResultQuery = (clone $resultQuery)->where('checked_at', '>=', $from);

        $email = strtolower($request->user()->email);

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'period' => $period,
            'overview' => [
                'total' => $devices->count(),
                'online' => $latestResults->where('status', 'online')->count(),
                'offline' => $latestResults->where('status', 'offline')->count(),
                'notMonitored' => $devices->count() - $latestResults->count(),
                'deviceTypes' => (clone $deviceQuery)->distinct('device_type')->count('device_type'),
            ],
            'availability' => [
                'onlineChecks' => (clone $periodResultQuery)->where('status', 'online')->count(),
                'totalChecks' => (clone $periodResultQuery)->count(),
            ],
            'distribution' => (clone $deviceQuery)
                ->selectRaw('device_type, COUNT(*) as total')
                ->groupBy('device_type')
                ->orderBy('device_type')
                ->get()
                ->map(fn ($row) => ['name' => $row->device_type, 'value' => (int) $row->total])
                ->values(),
            // These are actual checks only. The cap keeps a busy 30-day dashboard responsive.
            'history' => (clone $periodResultQuery)
                ->select(['id', 'latency', 'packet_loss', 'status', 'checked_at'])
                ->latest('checked_at')
                ->limit(1000)
                ->get()
                ->reverse()
                ->values()
                ->map(fn (MonitoringResult $result) => [
                    'checkedAt' => $result->checked_at->toIso8601String(),
                    'latency' => $result->latency,
                    'packetLoss' => $result->packet_loss,
                    'status' => $result->status,
                ]),
            'health' => $devices
                ->filter(fn (Device $device) => ! $device->latestMonitoringResult || $device->latestMonitoringResult->status === 'offline')
                ->take(12)
                ->values()
                ->map(fn (Device $device) => $this->deviceHealth($device)),
            'recentActivity' => ($recentActivity = (clone $resultQuery)
                ->with('device:id,name,device_type')
                ->latest('checked_at')
                ->paginate(5, ['*'], 'activity_page', $activityPage))
                ->getCollection()
                ->map(fn (MonitoringResult $result) => [
                    'id' => $result->id,
                    'deviceId' => $result->device_id,
                    'deviceName' => $result->device->name,
                    'deviceType' => $result->device->device_type,
                    'status' => $result->status,
                    'latency' => $result->latency,
                    'packetLoss' => $result->packet_loss,
                    'checkedAt' => $result->checked_at->toIso8601String(),
                ])->values(),
            'recentActivityPagination' => [
                'currentPage' => $recentActivity->currentPage(),
                'lastPage' => $recentActivity->lastPage(),
                'total' => $recentActivity->total(),
            ],
        ]);
    }

    private function deviceHealth(Device $device): array
    {
        $result = $device->latestMonitoringResult;

        return [
            'id' => $device->id,
            'name' => $device->name,
            'deviceType' => $device->device_type,
            'status' => $result?->status ?? 'unknown',
            'latency' => $result?->latency,
            'packetLoss' => $result?->packet_loss,
            'checkedAt' => $result?->checked_at?->toIso8601String(),
        ];
    }
}
