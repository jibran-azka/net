<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class MonitoringResult extends Model {
    protected $fillable = ['device_id', 'status', 'latency', 'packet_loss', 'packets_sent', 'packets_received', 'error_message', 'checked_at'];
    protected function casts(): array { return ['latency' => 'float', 'packet_loss' => 'float', 'checked_at' => 'datetime']; }
    public function device(): BelongsTo { return $this->belongsTo(Device::class); }
}
