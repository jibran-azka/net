<?php
namespace App\Http\Controllers;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->validate(['filter' => ['nullable', 'in:all,unread']])['filter'] ?? 'all';
        $notifications = $request->user()->notifications()
            ->when($filter === 'unread', fn (Builder $query) => $query->whereNull('read_at'))
            ->reorder('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $notifications->through(fn ($notification) => [
            'id' => $notification->id,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
            ...$notification->data,
        ]);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filter' => $filter,
            'unreadCount' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function read(Request $request, string $notification)
    {
        $item = $request->user()->notifications()->whereKey($notification)->firstOrFail();
        $item->markAsRead();

        return ($alertId = $item->data['alert_id'] ?? null)
            ? redirect()->route('alerts.index', ['alert' => $alertId])
            : back();
    }

    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }
}
