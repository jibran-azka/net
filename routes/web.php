<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DeviceInterfaceController;
use App\Http\Controllers\IpAddressController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/devices', [DeviceController::class, 'index'])
        ->name('devices.index');

    Route::post('/devices', [DeviceController::class, 'store'])
        ->name('devices.store');

    Route::get('/devices/create', [DeviceController::class, 'create'])
        ->name('devices.create');
    Route::get('/devices/{device}', [DeviceController::class, 'show'])
        ->name('devices.show');
    Route::get('/devices/{device}/edit', [DeviceController::class, 'edit'])->name('devices.edit');
    Route::put('/devices/{device}', [DeviceController::class, 'update'])->name('devices.update');
    Route::delete('/devices/{device}', [DeviceController::class, 'destroy'])->name('devices.destroy');

    Route::post('/devices/{device}/ip-addresses', [IpAddressController::class, 'store'])->name('devices.ip-addresses.store');
    Route::put('/devices/{device}/ip-addresses/{ipAddress}', [IpAddressController::class, 'update'])->name('devices.ip-addresses.update');
    Route::delete('/devices/{device}/ip-addresses/{ipAddress}', [IpAddressController::class, 'destroy'])->name('devices.ip-addresses.destroy');
    Route::patch('/devices/{device}/ip-addresses/{ipAddress}/primary', [IpAddressController::class, 'setPrimary'])->name('devices.ip-addresses.primary');

    Route::post('/devices/{device}/interfaces', [DeviceInterfaceController::class, 'store'])->name('devices.interfaces.store');
    Route::put('/devices/{device}/interfaces/{interface}', [DeviceInterfaceController::class, 'update'])->name('devices.interfaces.update');
    Route::delete('/devices/{device}/interfaces/{interface}', [DeviceInterfaceController::class, 'destroy'])->name('devices.interfaces.destroy');
});

require __DIR__.'/settings.php';
