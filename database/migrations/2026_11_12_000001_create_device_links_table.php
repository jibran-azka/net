
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_links', function (Blueprint $table) {
            $table->id();

            // SQL Server uses NO ACTION instead of RESTRICT.
            $table->foreignId('source_interface_id')
                ->constrained('device_interfaces')
                ->noActionOnDelete();

            $table->foreignId('target_interface_id')
                ->constrained('device_interfaces')
                ->noActionOnDelete();

            $table->string('connection_type', 30);
            $table->string('label')->nullable();
            $table->string('status', 30)->default('unknown');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('source_interface_id');
            $table->index('target_interface_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_links');
    }
};
