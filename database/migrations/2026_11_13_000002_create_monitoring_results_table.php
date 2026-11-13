<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monitoring_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20);
            $table->decimal('latency', 10, 2)->nullable();
            $table->decimal('packet_loss', 5, 2)->default(100);
            $table->unsignedInteger('packets_sent');
            $table->unsignedInteger('packets_received');
            $table->text('error_message')->nullable();
            $table->timestamp('checked_at')->index();
            $table->timestamps();
            $table->index(['device_id', 'checked_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('monitoring_results'); }
};
