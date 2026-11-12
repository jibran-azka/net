<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('topology_positions', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('topology_positions', function (Blueprint $table) {
            $table->foreign('device_id')
                ->references('id')
                ->on('devices')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('topology_positions', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
        });

        Schema::table('topology_positions', function (Blueprint $table) {
            $table->foreign('device_id')
                ->references('id')
                ->on('devices')
                ->noActionOnDelete();
        });
    }
};
