
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ip_addresses', function (Blueprint $table) {
            $table->id();

            $table->foreignId('device_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('address', 45);
            $table->string('subnet_mask', 45)->nullable();
            $table->string('gateway', 45)->nullable();

            $table->string('role', 30)
                ->default('management');

            $table->boolean('is_primary')->default(false);

            $table->timestamps();

            $table->unique(['device_id', 'address']);
            $table->index('address');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ip_addresses');
    }
};
