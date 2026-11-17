<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // SQL Server rejects a second cascade path through devices.user_id.
            $table->foreignId('device_id')->constrained()->noActionOnDelete();
            $table->string('alert_type', 50);
            $table->string('severity', 20);
            $table->string('title');
            $table->text('message');
            $table->string('status', 20);
            $table->timestamp('triggered_at')->index();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['device_id', 'alert_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};


