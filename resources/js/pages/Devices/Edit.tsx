import { Head, Link, router, useForm } from '@inertiajs/react';
import DeviceForm, { type DeviceValues } from './DeviceForm';

type IpAddress = {
    id: number;
    address: string;
    subnet_mask: string | null;
    gateway: string | null;
    role: string;
    is_primary: boolean;
};

type NetworkInterface = {
    id: number;
    name: string;
    mac_address: string | null;
    description: string | null;
};

type EditableDevice = DeviceValues & {
    id: number;
    ip_addresses: IpAddress[];
    interfaces: NetworkInterface[];
};

function AddIpAddress({ deviceId }: { deviceId: number }) {
    const form = useForm({ address: '', subnet_mask: '', gateway: '', role: 'management', is_primary: false });

    return <form className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); form.post(`/devices/${deviceId}/ip-addresses`, { onSuccess: () => form.reset() }); }}>
        <input className="rounded-lg border p-2" placeholder="IP address *" value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} />
        <input className="rounded-lg border p-2" placeholder="Subnet mask or /24" value={form.data.subnet_mask} onChange={(event) => form.setData('subnet_mask', event.target.value)} />
        <input className="rounded-lg border p-2" placeholder="Gateway" value={form.data.gateway} onChange={(event) => form.setData('gateway', event.target.value)} />
        <select className="rounded-lg border p-2" value={form.data.role} onChange={(event) => form.setData('role', event.target.value)}>
            {['management', 'lan', 'wan', 'loopback', 'service', 'other'].map((role) => <option key={role}>{role}</option>)}
        </select>
        <label className="flex items-center gap-2 rounded-lg border bg-white px-3"><input type="checkbox" checked={form.data.is_primary} onChange={(event) => form.setData('is_primary', event.target.checked)} /> Primary IP</label>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50" disabled={form.processing}>Add IP Address</button>
        {Object.values(form.errors).map((error) => <p key={error} className="text-sm text-red-600">{error}</p>)}
    </form>;
}

function AddInterface({ deviceId }: { deviceId: number }) {
    const form = useForm({ name: '', mac_address: '', description: '' });

    return <form className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); form.post(`/devices/${deviceId}/interfaces`, { onSuccess: () => form.reset() }); }}>
        <input className="rounded-lg border p-2" placeholder="Interface name *" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
        <input className="rounded-lg border p-2" placeholder="MAC address" value={form.data.mac_address} onChange={(event) => form.setData('mac_address', event.target.value)} />
        <input className="rounded-lg border p-2" placeholder="Description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50 md:col-start-3" disabled={form.processing}>Add Interface</button>
        {Object.values(form.errors).map((error) => <p key={error} className="text-sm text-red-600">{error}</p>)}
    </form>;
}

export default function Edit({
    device,
    deviceTypes,
    statuses,
}: {
    device: EditableDevice;
    deviceTypes: string[];
    statuses: string[];
}) {
    return (
        <>
            <Head title={`Edit ${device.name}`} />
            <main className="mx-auto max-w-6xl space-y-6 p-6 text-slate-800">
                <Link href="/devices" className="text-blue-600">
                    ← Back to Inventory
                </Link>
                <h1 className="mt-4 text-2xl font-bold">Edit Network Device</h1>
                <p className="text-gray-500">Update device information, IP addresses, and network interfaces in one place.</p>
                <DeviceForm
                    device={device}
                    deviceTypes={deviceTypes}
                    statuses={statuses}
                    method="put"
                />
                <section className="rounded-xl border p-5">
                    <h2 className="text-lg font-semibold">IP Addresses</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage addresses assigned to this device.</p>
                    {device.ip_addresses.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-slate-500"><tr><th className="pb-2">Address</th><th className="pb-2">Subnet</th><th className="pb-2">Gateway</th><th className="pb-2">Role</th><th className="pb-2">Actions</th></tr></thead><tbody>{device.ip_addresses.map((ip) => <tr className="border-b" key={ip.id}><td className="py-3 font-medium">{ip.address} {ip.is_primary && <span className="ml-1 text-xs text-green-700">Primary</span>}</td><td>{ip.subnet_mask || '—'}</td><td>{ip.gateway || '—'}</td><td>{ip.role}</td><td className="whitespace-nowrap"><button className="mr-3 text-blue-600" onClick={() => router.patch(`/devices/${device.id}/ip-addresses/${ip.id}/primary`)}>Set primary</button><button className="text-red-600" onClick={() => confirm(`Delete ${ip.address}?`) && router.delete(`/devices/${device.id}/ip-addresses/${ip.id}`)}>Delete</button></td></tr>)}</tbody></table></div>}
                    <AddIpAddress deviceId={device.id} />
                </section>
                <section className="rounded-xl border p-5">
                    <h2 className="text-lg font-semibold">Network Interfaces</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage the ports available for topology connections.</p>
                    {device.interfaces.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-slate-500"><tr><th className="pb-2">Name</th><th className="pb-2">MAC Address</th><th className="pb-2">Description</th><th className="pb-2">Actions</th></tr></thead><tbody>{device.interfaces.map((item) => <tr className="border-b" key={item.id}><td className="py-3 font-medium">{item.name}</td><td>{item.mac_address || '—'}</td><td>{item.description || '—'}</td><td><button className="text-red-600" onClick={() => confirm(`Delete ${item.name}? This also removes topology links using it.`) && router.delete(`/devices/${device.id}/interfaces/${item.id}`)}>Delete</button></td></tr>)}</tbody></table></div>}
                    <AddInterface deviceId={device.id} />
                </section>
            </main>
        </>
    );
}
