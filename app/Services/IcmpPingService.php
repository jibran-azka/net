<?php
namespace App\Services;

use App\Models\Device;
use Symfony\Component\Process\Process;

class IcmpPingService
{
    public function check(Device $device, int $timeout, int $count): array
    {
        $ip = $device->ipAddresses()->where('is_primary', true)->value('address');
        if (! $ip) return $this->result($count, 0, null, 'Device does not have a primary IP address.');
        if (! filter_var($ip, FILTER_VALIDATE_IP)) return $this->result($count, 0, null, 'Primary IP address is invalid.');
        $windows = PHP_OS_FAMILY === 'Windows';
        $command = $windows ? ['ping', '-n', (string) $count, '-w', (string) ($timeout * 1000), $ip] : ['ping', '-c', (string) $count, '-W', (string) $timeout, $ip];
        try {
            $process = new Process($command, timeout: max(5, ($timeout * $count) + 3));
            $process->run();
            return $this->parse($process->getOutput().'\n'.$process->getErrorOutput(), $count);
        } catch (\Throwable $exception) {
            return $this->result($count, 0, null, 'Ping execution failed: '.$exception->getMessage());
        }
    }
    private function parse(string $output, int $sent): array
    {
        preg_match('/(?:Received|received)\s*=\s*(\d+)|(?:,\s*)(\d+)\s+received/i', $output, $receivedMatch);
        $received = (int) (($receivedMatch[1] ?? null) ?: ($receivedMatch[2] ?? 0));
        preg_match('/(?:Average|avg)\s*=\s*<?([\d.]+)|=\s*[\d.]+\/([\d.]+)\//i', $output, $latencyMatch);
        $latency = isset($latencyMatch[1]) && $latencyMatch[1] !== '' ? (float) $latencyMatch[1] : (isset($latencyMatch[2]) ? (float) $latencyMatch[2] : null);
        return $this->result($sent, $received, $latency, $received ? null : 'No ICMP reply received.');
    }
    private function result(int $sent, int $received, ?float $latency, ?string $error): array
    {
        return ['status' => $received > 0 ? 'online' : 'offline', 'latency' => $latency, 'packet_loss' => $sent ? round((($sent - $received) / $sent) * 100, 2) : 100, 'packets_sent' => $sent, 'packets_received' => $received, 'error_message' => $error, 'checked_at' => now()];
    }
}
