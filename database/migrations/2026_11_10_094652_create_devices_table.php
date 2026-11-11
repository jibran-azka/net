<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('hostname')->nullable();

            $table->string('device_type', 50);
            $table->string('vendor')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('mac_address', 17)->nullable();

            $table->string('location')->nullable();

            $table->string('lifecycle_status', 30)
                ->default('active');

            $table->text('description')->nullable();

            $table->timestamps();

            $table->index('device_type');
            $table->index('lifecycle_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
