import { Link, useForm } from '@inertiajs/react';

export type DeviceValues = { name: string; hostname: string; device_type: string; vendor: string; model: string; serial_number: string; mac_address: string; location: string; lifecycle_status: string; description: string };

export default function DeviceForm({ device, deviceTypes, statuses, method = 'post' }: { device: DeviceValues & { id?: number }; deviceTypes: string[]; statuses: string[]; method?: 'post' | 'put' }) {
    const form = useForm(device);
    const submit = (event: React.FormEvent) => { event.preventDefault(); method === 'post' ? form.post('/devices') : form.put(`/devices/${device.id}`); };
    const fields: Array<[keyof DeviceValues, string]> = [['name', 'Device Name *'], ['hostname', 'Hostname'], ['vendor', 'Vendor'], ['model', 'Model'], ['serial_number', 'Serial Number'], ['mac_address', 'MAC Address'], ['location', 'Location']];
    return <form onSubmit={submit} className="space-y-5 rounded-xl border p-6">
        <div className="grid gap-5 md:grid-cols-2">
            {fields.map(([key, label]) => <div key={key}><label className="mb-1 block text-sm font-medium">{label}</label><input className="w-full rounded-lg border p-2" value={form.data[key]} onChange={e => form.setData(key, e.target.value)} />{form.errors[key] && <p className="mt-1 text-sm text-red-600">{form.errors[key]}</p>}</div>)}
            <div><label className="mb-1 block text-sm font-medium">Device Type *</label><select className="w-full rounded-lg border p-2" value={form.data.device_type} onChange={e => form.setData('device_type', e.target.value)}>{deviceTypes.map(type => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}</select>{form.errors.device_type && <p className="mt-1 text-sm text-red-600">{form.errors.device_type}</p>}</div>
            <div><label className="mb-1 block text-sm font-medium">Lifecycle Status *</label><select className="w-full rounded-lg border p-2" value={form.data.lifecycle_status} onChange={e => form.setData('lifecycle_status', e.target.value)}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select>{form.errors.lifecycle_status && <p className="mt-1 text-sm text-red-600">{form.errors.lifecycle_status}</p>}</div>
        </div>
        <div><label className="mb-1 block text-sm font-medium">Description</label><textarea className="w-full rounded-lg border p-2" rows={4} value={form.data.description} onChange={e => form.setData('description', e.target.value)} />{form.errors.description && <p className="mt-1 text-sm text-red-600">{form.errors.description}</p>}</div>
        <div className="flex justify-end gap-3"><Link href="/devices" className="rounded-lg border px-4 py-2">Cancel</Link><button disabled={form.processing} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{form.processing ? 'Saving...' : 'Save Device'}</button></div>
    </form>;
}
