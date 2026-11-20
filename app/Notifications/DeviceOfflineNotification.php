<?php
namespace App\Notifications;
use App\Models\Alert;
use Illuminate\Notifications\Notification;
class DeviceOfflineNotification extends Notification {
    public function __construct(public Alert $alert) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toDatabase(object $notifiable): array {
        return [
            'alert_id' => $this->alert->id,
            'device_id' => $this->alert->device_id,
            'title' => 'Device Offline',
            'message' => $this->alert->message,
            'device_name' => $this->alert->device?->name,
            'severity' => 'critical',
        ];
    }
}
