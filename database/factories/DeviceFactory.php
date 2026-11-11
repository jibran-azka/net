<?php

namespace Database\Factories;

use App\Models\Device;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Device> */
class DeviceFactory extends Factory
{
    protected $model = Device::class;

    public function definition(): array
    {
        return ['name' => fake()->unique()->company(), 'device_type' => 'switch', 'lifecycle_status' => 'active'];
    }
}
