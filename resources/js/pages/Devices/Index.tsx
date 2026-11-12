import { Head, Link, router } from '@inertiajs/react';

type Device = {
    id: number;
    name: string;
    hostname: string | null;
    device_type: string;
    vendor: string | null;
    model: string | null;
    location: string | null;
    lifecycle_status: string;
};
type Pagination = {
    data: Device[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function Index({
    devices,
    filters,
    deviceTypes,
    statuses,
    total,
}: {
    devices: Pagination;
    filters: Record<string, string | undefined>;
    deviceTypes: string[];
    statuses: string[];
    total: number;
}) {
    const update = (key: string, value: string) =>
        router.get(
            '/devices',
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    const destroy = (device: Device) => {
        if (
            confirm(
                `Delete ${device.name}? This also deletes its IP addresses and interfaces.`,
            )
        )
            router.delete(`/devices/${device.id}`);
    };
    return (
        <>
            <Head title="Network Inventory" />
            <main className="p-6 text-slate-800">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Network Inventory
                        </h1>
                        <p className="text-gray-500">
                            {total} device{total === 1 ? '' : 's'} in your
                            inventory.
                        </p>
                    </div>
                    <Link
                        href="/devices/create"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                    >
                        Add Device
                    </Link>
                </div>
                <div className="mb-5 grid gap-3 rounded-xl border p-4 md:grid-cols-4">
                    <input
                        value={filters.search ?? ''}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder="Search name, hostname, vendor..."
                        className="rounded-lg border p-2"
                    />
                    <select
                        value={filters.device_type ?? ''}
                        onChange={(e) => update('device_type', e.target.value)}
                        className="rounded-lg border p-2"
                    >
                        <option value="">All types</option>
                        {deviceTypes.map((v) => (
                            <option key={v} value={v}>
                                {v.replaceAll('_', ' ')}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.lifecycle_status ?? ''}
                        onChange={(e) =>
                            update('lifecycle_status', e.target.value)
                        }
                        className="rounded-lg border p-2"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                    <input
                        value={filters.location ?? ''}
                        onChange={(e) => update('location', e.target.value)}
                        placeholder="Filter location"
                        className="rounded-lg border p-2"
                    />
                </div>
                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    'Device Name',
                                    'Hostname',
                                    'Type',
                                    'Vendor',
                                    'Model',
                                    'Location',
                                    'Status',
                                    'Actions',
                                ].map((h) => (
                                    <th key={h} className="p-3 text-sm">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {devices.data.length ? (
                                devices.data.map((device) => (
                                    <tr key={device.id} className="border-t">
                                        <td className="p-3 font-medium">
                                            <Link
                                                href={`/devices/${device.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {device.name}
                                            </Link>
                                        </td>
                                        <td className="p-3">
                                            {device.hostname ?? '—'}
                                        </td>
                                        <td className="p-3">
                                            {device.device_type.replaceAll(
                                                '_',
                                                ' ',
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {device.vendor ?? '—'}
                                        </td>
                                        <td className="p-3">
                                            {device.model ?? '—'}
                                        </td>
                                        <td className="p-3">
                                            {device.location ?? '—'}
                                        </td>
                                        <td className="p-3">
                                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                                                {device.lifecycle_status}
                                            </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <Link
                                                className="mr-3 text-blue-600"
                                                href={`/devices/${device.id}`}
                                            >
                                                View
                                            </Link>
                                            <Link
                                                className="mr-3 text-blue-600"
                                                href={`/devices/${device.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                className="text-red-600"
                                                onClick={() => destroy(device)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="p-10 text-center text-gray-500"
                                    >
                                        No devices found. Adjust the filters or
                                        add your first device.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {devices.last_page > 1 && (
                    <nav className="mt-4 flex gap-1">
                        {devices.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                className={`rounded border px-3 py-1 ${link.active ? 'bg-blue-600 text-white' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                )}
            </main>
        </>
    );
}
