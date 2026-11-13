<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monitoring_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('enabled')->default(false);
            $table->unsignedInteger('interval_seconds')->default(60);
            $table->unsignedInteger('timeout_seconds')->default(2);
            $table->unsignedInteger('packet_count')->default(4);
            $table->timestamp('last_checked_at')->nullable()->index();
            $table->timestamps();
            $table->index(['enabled', 'last_checked_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('monitoring_configs'); }
};
