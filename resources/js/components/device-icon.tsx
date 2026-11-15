import {
    Cable,
    Laptop,
    Monitor,
    Network,
    Radio,
    RadioTower,
    Router,
    Server,
    Shield,
    Waypoints,
    Wifi,
    type LucideIcon,
} from 'lucide-react';

export const deviceIconMap: Record<string, LucideIcon> = {
    router: Router,
    switch: Cable,
    server: Server,
    firewall: Shield,
    access_point: Wifi,
    wireless_controller: RadioTower,
    modem: Radio,
    load_balancer: Waypoints,
    pc: Monitor,
    laptop: Laptop,
    other: Network,
};

export function deviceTypeLabel(type: string) {
    return type.replaceAll('_', ' ').replace(/\\b\\w/g, (letter) => letter.toUpperCase());
}

export function DeviceIcon({ type, size = 24, strokeWidth = 1.8, className }: { type: string; size?: number; strokeWidth?: number; className?: string }) {
    const Icon = deviceIconMap[type] ?? Network;
    return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
