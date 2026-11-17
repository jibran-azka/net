<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Inertia\Inertia;
class NotificationController extends Controller {
    public function index(Request $request) { return Inertia::render('Notifications/Index', ['notifications' => $request->user()->notifications()->reorder('created_at', 'desc')->paginate(15)->withQueryString()]); }
    public function read(Request $request, string $notification) { $item = $request->user()->notifications()->whereKey($notification)->firstOrFail(); $item->markAsRead(); $alertId = $item->data['alert_id'] ?? null; return $alertId ? redirect()->route('alerts.index', ['alert' => $alertId]) : back(); }
    public function readAll(Request $request) { $request->user()->unreadNotifications->markAsRead(); return back(); }
}
