<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class MonitoringConfig extends Model {
    protected $fillable = ['enabled', 'interval_seconds', 'timeout_seconds', 'packet_count', 'last_checked_at'];
    protected function casts(): array { return ['enabled' => 'boolean', 'interval_seconds' => 'integer', 'timeout_seconds' => 'integer', 'packet_count' => 'integer', 'last_checked_at' => 'datetime']; }
    public function device(): BelongsTo { return $this->belongsTo(Device::class); }
}
