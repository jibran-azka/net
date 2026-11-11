
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_interfaces', function (Blueprint $table) {
            $table->id();

            $table->foreignId('device_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('mac_address', 17)->nullable();
            $table->string('description')->nullable();

            $table->timestamps();

            $table->unique(['device_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_interfaces');
    }
};
