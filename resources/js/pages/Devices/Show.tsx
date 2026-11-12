import { Head, Link, router, useForm } from '@inertiajs/react';

type Ip = {
    id: number;
    address: string;
    subnet_mask: string | null;
    gateway: string | null;
    role: string;
    is_primary: boolean;
};
type Interface = {
    id: number;
    name: string;
    mac_address: string | null;
    description: string | null;
};
type Device = {
    id: number;
    name: string;
    hostname: string | null;
    device_type: string;
    vendor: string | null;
    model: string | null;
    serial_number: string | null;
    mac_address: string | null;
    location: string | null;
    lifecycle_status: string;
    description: string | null;
    ip_addresses: Ip[];
    interfaces: Interface[];
};

function IpForm({ deviceId }: { deviceId: number }) {
    const form = useForm({
        address: '',
        subnet_mask: '',
        gateway: '',
        role: 'management',
        is_primary: false,
    });
    return (
        <form
            className="mt-4 grid gap-2 rounded-lg bg-gray-50 p-3 md:grid-cols-3"
            onSubmit={(e) => {
                e.preventDefault();
                form.post(`/devices/${deviceId}/ip-addresses`, {
                    onSuccess: () => form.reset(),
                });
            }}
        >
            <input
                placeholder="IP address *"
                value={form.data.address}
                onChange={(e) => form.setData('address', e.target.value)}
                className="rounded border p-2"
            />
            <input
                placeholder="Subnet mask or /24"
                value={form.data.subnet_mask}
                onChange={(e) => form.setData('subnet_mask', e.target.value)}
                className="rounded border p-2"
            />
            <input
                placeholder="Gateway"
                value={form.data.gateway}
                onChange={(e) => form.setData('gateway', e.target.value)}
                className="rounded border p-2"
            />
            <select
                value={form.data.role}
                onChange={(e) => form.setData('role', e.target.value)}
                className="rounded border p-2"
            >
                {[
                    'management',
                    'lan',
                    'wan',
                    'loopback',
                    'service',
                    'other',
                ].map((x) => (
                    <option key={x}>{x}</option>
                ))}
            </select>
            <label className="flex items-center gap-2 p-2">
                <input
                    type="checkbox"
                    checked={form.data.is_primary}
                    onChange={(e) =>
                        form.setData('is_primary', e.target.checked)
                    }
                />{' '}
                Primary
            </label>
            <button
                className="rounded bg-blue-600 p-2 text-white"
                disabled={form.processing}
            >
                Add IP
            </button>
            {Object.values(form.errors).map((error) => (
                <p key={error} className="text-sm text-red-600">
                    {error}
                </p>
            ))}
        </form>
    );
}
function InterfaceForm({ deviceId }: { deviceId: number }) {
    const form = useForm({ name: '', mac_address: '', description: '' });
    return (
        <form
            className="mt-4 grid gap-2 rounded-lg bg-gray-50 p-3 md:grid-cols-3"
            onSubmit={(e) => {
                e.preventDefault();
                form.post(`/devices/${deviceId}/interfaces`, {
                    onSuccess: () => form.reset(),
                });
            }}
        >
            <input
                placeholder="Interface name *"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                className="rounded border p-2"
            />
            <input
                placeholder="MAC address"
                value={form.data.mac_address}
                onChange={(e) => form.setData('mac_address', e.target.value)}
                className="rounded border p-2"
            />
            <input
                placeholder="Description"
                value={form.data.description}
                onChange={(e) => form.setData('description', e.target.value)}
                className="rounded border p-2"
            />
            <button
                className="rounded bg-blue-600 p-2 text-white"
                disabled={form.processing}
            >
                Add Interface
            </button>
            {Object.values(form.errors).map((error) => (
                <p key={error} className="text-sm text-red-600">
                    {error}
                </p>
            ))}
        </form>
    );
}

export default function Show({ device }: { device: Device }) {
    const removeDevice = () => {
        if (confirm(`Delete ${device.name}?`))
            router.delete(`/devices/${device.id}`);
    };
    const editIp = (ip: Ip) => {
        const address = prompt('IP address', ip.address);
        if (address === null) return;
        router.put(`/devices/${device.id}/ip-addresses/${ip.id}`, {
            address,
            subnet_mask:
                prompt('Subnet mask / prefix', ip.subnet_mask ?? '') ?? '',
            gateway: prompt('Gateway', ip.gateway ?? '') ?? '',
            role: prompt('Role', ip.role) ?? ip.role,
            is_primary: ip.is_primary,
        });
    };
    const editInterface = (item: Interface) => {
        const name = prompt('Interface name', item.name);
        if (name === null) return;
        router.put(`/devices/${device.id}/interfaces/${item.id}`, {
            name,
            mac_address: prompt('MAC address', item.mac_address ?? '') ?? '',
            description: prompt('Description', item.description ?? '') ?? '',
        });
    };
    const fields = [
        ['Hostname', device.hostname],
        ['Device Type', device.device_type.replaceAll('_', ' ')],
        ['Vendor', device.vendor],
        ['Model', device.model],
        ['Serial Number', device.serial_number],
        ['MAC Address', device.mac_address],
        ['Location', device.location],
        ['Status', device.lifecycle_status],
    ];
    return (
        <>
            <Head title={device.name} />
            <main className="mx-auto max-w-6xl space-y-6 p-6 text-slate-800">
                <div className="flex items-start justify-between">
                    <div>
                        <Link href="/devices" className="text-blue-600">
                            ← Back to Inventory
                        </Link>
                        <h1 className="mt-3 text-2xl font-bold">
                            {device.name}
                        </h1>
                        <p className="text-gray-500">
                            {device.hostname ?? 'No hostname'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/devices/${device.id}/edit`}
                            className="rounded border px-3 py-2"
                        >
                            Edit
                        </Link>
                        <button
                            className="rounded bg-red-600 px-3 py-2 text-white"
                            onClick={removeDevice}
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <section className="rounded-xl border p-5">
                    <h2 className="mb-4 text-lg font-semibold">
                        Device Information
                    </h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        {fields.map(([label, value]) => (
                            <div key={label}>
                                <p className="text-sm text-gray-500">{label}</p>
                                <p>{value || '—'}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Description</p>
                        <p>{device.description || '—'}</p>
                    </div>
                </section>
                <section className="rounded-xl border p-5">
                    <h2 className="text-lg font-semibold">IP Addresses</h2>
                    {device.ip_addresses.length ? (
                        <table className="mt-3 w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th>Address</th>
                                    <th>Subnet</th>
                                    <th>Gateway</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {device.ip_addresses.map((ip) => (
                                    <tr key={ip.id} className="border-b">
                                        <td className="py-2">
                                            {ip.address}
                                            {ip.is_primary && (
                                                <span className="ml-2 text-xs text-green-700">
                                                    Primary
                                                </span>
                                            )}
                                        </td>
                                        <td>{ip.subnet_mask ?? '—'}</td>
                                        <td>{ip.gateway ?? '—'}</td>
                                        <td>{ip.role}</td>
                                        <td>
                                            <button
                                                className="mr-3 text-blue-600"
                                                onClick={() => editIp(ip)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="mr-3 text-blue-600"
                                                onClick={() =>
                                                    router.patch(
                                                        `/devices/${device.id}/ip-addresses/${ip.id}/primary`,
                                                    )
                                                }
                                            >
                                                Set primary
                                            </button>
                                            <button
                                                className="text-red-600"
                                                onClick={() =>
                                                    confirm(
                                                        `Delete ${ip.address}?`,
                                                    ) &&
                                                    router.delete(
                                                        `/devices/${device.id}/ip-addresses/${ip.id}`,
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="mt-2 text-gray-500">
                            No IP addresses registered.
                        </p>
                    )}
                    <IpForm deviceId={device.id} />
                </section>
                <section className="rounded-xl border p-5">
                    <h2 className="text-lg font-semibold">
                        Network Interfaces
                    </h2>
                    {device.interfaces.length ? (
                        <table className="mt-3 w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th>Name</th>
                                    <th>MAC Address</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {device.interfaces.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="py-2">{item.name}</td>
                                        <td>{item.mac_address ?? '—'}</td>
                                        <td>{item.description ?? '—'}</td>
                                        <td>
                                            <button
                                                className="mr-3 text-blue-600"
                                                onClick={() =>
                                                    editInterface(item)
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-600"
                                                onClick={() =>
                                                    confirm(
                                                        `Delete ${item.name}?`,
                                                    ) &&
                                                    router.delete(
                                                        `/devices/${device.id}/interfaces/${item.id}`,
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="mt-2 text-gray-500">
                            No interfaces registered.
                        </p>
                    )}
                    <InterfaceForm deviceId={device.id} />
                </section>
            </main>
        </>
    );
}
