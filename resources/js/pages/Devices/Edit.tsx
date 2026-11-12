import { Head, Link } from '@inertiajs/react';
import DeviceForm, { type DeviceValues } from './DeviceForm';

export default function Edit({
    device,
    deviceTypes,
    statuses,
}: {
    device: DeviceValues & { id: number };
    deviceTypes: string[];
    statuses: string[];
}) {
    return (
        <>
            <Head title={`Edit ${device.name}`} />
            <main className="mx-auto max-w-3xl p-6 text-slate-800">
                <Link href={`/devices/${device.id}`} className="text-blue-600">
                    ← Back to Device
                </Link>
                <h1 className="mt-4 text-2xl font-bold">Edit Network Device</h1>
                <p className="mb-6 text-gray-500">Update device information.</p>
                <DeviceForm
                    device={device}
                    deviceTypes={deviceTypes}
                    statuses={statuses}
                    method="put"
                />
            </main>
        </>
    );
}
