import { Head, Link } from '@inertiajs/react';
import DeviceForm from './DeviceForm';

export default function Create({
    deviceTypes,
    statuses,
}: {
    deviceTypes: string[];
    statuses: string[];
}) {
    return (
        <>
            <Head title="Add Device" />
            <main className="mx-auto max-w-3xl p-6 text-slate-800">
                <Link href="/devices" className="text-blue-600">
                    ← Back to Inventory
                </Link>
                <h1 className="mt-4 text-2xl font-bold">Add Network Device</h1>
                <p className="mb-6 text-gray-500">
                    Register a device in your inventory.
                </p>
                <DeviceForm
                    device={{
                        name: '',
                        hostname: '',
                        device_type: 'switch',
                        vendor: '',
                        model: '',
                        serial_number: '',
                        mac_address: '',
                        location: '',
                        lifecycle_status: 'active',
                        description: '',
                    }}
                    deviceTypes={deviceTypes}
                    statuses={statuses}
                />
            </main>
        </>
    );
}
