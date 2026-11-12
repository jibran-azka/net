import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    addEdge,
    Background,
    Controls,
    Handle,
    MiniMap,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Edge,
    type Node,
    type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Router, Server, Shield, Wifi } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Interface = { id: number; name: string; mac_address: string | null; description: string | null };
type IpAddress = { id: number; address: string; subnet_mask: string | null; gateway: string | null; role: string; is_primary: boolean };
type Device = { id: number; name: string; hostname: string | null; device_type: string; vendor: string | null; model: string | null; location: string | null; lifecycle_status: string; interfaces: Interface[]; ip_addresses: IpAddress[]; topology_positions: { position_x: number; position_y: number }[] };
type Link = { id: number; source_interface_id: number; target_interface_id: number; connection_type: string; label: string | null; status: string; notes: string | null; source_interface: Interface & { device: Device }; target_interface: Interface & { device: Device } };
type DeviceNodeData = { device: Device };

const iconFor = (type: string) => ({ router: Router, server: Server, firewall: Shield, access_point: Wifi }[type] ?? Network);
function DeviceNode({ data }: NodeProps<Node<DeviceNodeData>>) {
    const { device } = data;
    const Icon = iconFor(device.device_type);
    return <div className="min-w-48 rounded-xl border border-blue-200 bg-white p-3 shadow-sm"><Handle type="target" position={Position.Top} /><div className="flex items-center gap-2"><span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Icon size={18} /></span><div><p className="font-semibold text-slate-800">{device.name}</p><p className="text-xs capitalize text-slate-500">{device.device_type.replaceAll('_', ' ')}</p></div></div><p className="mt-2 text-xs text-slate-500">{device.ip_addresses[0]?.address ?? 'No primary IP'}</p><Handle type="source" position={Position.Bottom} /></div>;
}
const nodeTypes = { device: DeviceNode };

function DeviceDetails({ device, links, onConnect }: { device: Device; links: Link[]; onConnect: () => void }) {
    const Icon = iconFor(device.device_type);
    const primaryIp = device.ip_addresses.find((address) => address.is_primary) ?? device.ip_addresses[0];
    const connections = links.filter((link) => link.source_interface.device.id === device.id || link.target_interface.device.id === device.id);

    return <div className="space-y-4 text-slate-800">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Device Details</h2><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Selected</span></div>
        <div className="flex items-center gap-3 border-b pb-4"><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={20} /></span><div className="min-w-0"><p className="font-semibold">{device.name}</p><p className="text-sm capitalize text-slate-500">{device.device_type.replaceAll("_", " ")}</p><span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{device.lifecycle_status}</span></div></div>
        <section><h3 className="mb-2 text-sm font-semibold">Device Information</h3><dl className="divide-y text-sm">{[["Hostname", device.hostname], ["Device Type", device.device_type.replaceAll("_", " ")], ["Vendor", device.vendor], ["Model", device.model], ["Location", device.location], ["Primary IP", primaryIp?.address]].map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-2 py-2"><dt className="text-slate-500">{label}</dt><dd>{value || "Not available"}</dd></div>)}</dl></section>
        <section className="border-t pt-4"><h3 className="mb-2 text-sm font-semibold">Network Interfaces</h3>{device.interfaces.length ? <div className="space-y-3">{device.interfaces.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-3"><p className="text-sm font-medium">{item.name}</p><p className="mt-1 text-xs text-slate-500">MAC Address: {item.mac_address || "Not set"}</p>{item.description && <p className="mt-1 text-xs text-slate-500">{item.description}</p>}</div>)}</div> : <p className="text-sm text-slate-500">No interfaces registered.</p>}</section>
        <section className="border-t pt-4"><h3 className="mb-2 text-sm font-semibold">Connections</h3>{connections.length ? <div className="space-y-2">{connections.map((link) => <div key={link.id} className="rounded-lg bg-slate-50 p-3 text-sm"><p className="font-medium">{link.source_interface.device.name} · {link.source_interface.name}</p><p className="text-slate-500">to {link.target_interface.device.name} · {link.target_interface.name}</p><p className="mt-1 text-xs capitalize text-slate-500">{link.connection_type} · {link.status}</p></div>)}</div> : <p className="text-sm text-slate-500">No connections for this device yet.</p>}</section>
        <button type="button" className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white" onClick={onConnect}>Connect Interface</button>
        <Link className="block w-full rounded-lg border px-3 py-2 text-center text-sm text-blue-700" href={`/devices/${device.id}`}>View Device Details</Link>
    </div>;
}

function ConnectionDetails({ link, onEdit, onDelete }: { link: Link; onEdit: () => void; onDelete: () => void }) {
    return <div className="space-y-4 text-slate-800"><h2 className="font-semibold">Connection Details</h2><div className="rounded-lg bg-slate-50 p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source interface</p><p className="mt-1 font-medium">{link.source_interface.device.name}</p><p>{link.source_interface.name}</p></div><div className="rounded-lg bg-slate-50 p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination interface</p><p className="mt-1 font-medium">{link.target_interface.device.name}</p><p>{link.target_interface.name}</p></div><dl className="space-y-2 text-sm"><div><dt className="text-slate-500">Connection type</dt><dd className="capitalize">{link.connection_type}</dd></div><div><dt className="text-slate-500">Status</dt><dd className="capitalize">{link.status}</dd></div>{link.label && <div><dt className="text-slate-500">Label</dt><dd>{link.label}</dd></div>}{link.notes && <div><dt className="text-slate-500">Notes</dt><dd>{link.notes}</dd></div>}</dl><button className="text-sm text-blue-600" onClick={onEdit}>Edit connection</button><button className="ml-4 text-sm text-red-600" onClick={onDelete}>Delete connection</button></div>;
}

function ConnectionForm({ devices, link, onClose }: { devices: Device[]; link?: Link; onClose: () => void }) {
    const form = useForm({ source_interface_id: String(link?.source_interface_id ?? ''), target_interface_id: String(link?.target_interface_id ?? ''), connection_type: link?.connection_type ?? 'ethernet', label: link?.label ?? '', status: link?.status ?? 'active', notes: link?.notes ?? '' });
    useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [onClose]);
    const selected = (id: string) => devices.find((device) => device.interfaces.some((item) => String(item.id) === id));
    const sourceDevice = selected(form.data.source_interface_id);
    const targetDevice = selected(form.data.target_interface_id);
    const submit = (event: React.FormEvent) => { event.preventDefault(); const options = { onSuccess: onClose }; link ? form.put(`/network-topology/links/${link.id}`, options) : form.post('/network-topology/links', options); };
    return <form onSubmit={submit} className="space-y-3"><h2 className="text-lg font-semibold">{link ? 'Edit Connection' : 'Add Connection'}</h2><select required className="w-full rounded border p-2" value={form.data.source_interface_id} onChange={(e) => form.setData('source_interface_id', e.target.value)}><option value="">Source interface</option>{devices.flatMap((device) => device.interfaces.map((item) => <option key={item.id} value={item.id}>{device.name} — {item.name}</option>))}</select><select required className="w-full rounded border p-2" value={form.data.target_interface_id} onChange={(e) => form.setData('target_interface_id', e.target.value)}><option value="">Target interface</option>{devices.flatMap((device) => device.interfaces.map((item) => <option key={item.id} value={item.id}>{device.name} — {item.name}</option>))}</select><div className="grid grid-cols-2 gap-2"><select className="rounded border p-2" value={form.data.connection_type} onChange={(e) => form.setData('connection_type', e.target.value)}>{['ethernet', 'fiber', 'wireless', 'serial', 'other'].map((item) => <option key={item}>{item}</option>)}</select><select className="rounded border p-2" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>{['active', 'inactive', 'unknown'].map((item) => <option key={item}>{item}</option>)}</select></div><input className="w-full rounded border p-2" placeholder="Label (optional)" value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} /><textarea className="w-full rounded border p-2" placeholder="Notes (optional)" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />{Object.values(form.errors).map((error) => <p key={error} className="text-sm text-red-600">{error}</p>)}<div className="flex justify-end gap-2"><button type="button" className="rounded border px-3 py-2" onClick={onClose}>Cancel</button><button className="rounded bg-blue-600 px-3 py-2 text-white" disabled={form.processing}>Save connection</button></div></form>;
}

function TopologyCanvas({ devices, links }: { devices: Device[]; links: Link[] }) {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null); const [selectedSidebarDevice, setSelectedSidebarDevice] = useState<number | null>(null); const [selectedLink, setSelectedLink] = useState<Link | null>(null); const [showForm, setShowForm] = useState(false); const [search, setSearch] = useState('');
    const { screenToFlowPosition } = useReactFlow();
    const initialNodes = useMemo<Node<DeviceNodeData>[]>(() => devices.flatMap((device) => device.topology_positions[0] ? [{ id: String(device.id), type: 'device', data: { device }, position: { x: device.topology_positions[0].position_x, y: device.topology_positions[0].position_y } }] : []), [devices]);
    const initialEdges = useMemo<Edge[]>(() => links.filter((link) => initialNodes.some((node) => node.id === String(link.source_interface.device.id)) && initialNodes.some((node) => node.id === String(link.target_interface.device.id))).map((link) => ({ id: String(link.id), source: String(link.source_interface.device.id), target: String(link.target_interface.device.id), label: `${link.source_interface.name} — ${link.target_interface.name}${link.label ? ` · ${link.label}` : ''}`, style: { stroke: link.status === 'active' ? '#2563eb' : link.status === 'inactive' ? '#94a3b8' : '#ca8a04' }, data: { linkId: link.id } })), [links, initialNodes]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes); const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    useEffect(() => { setEdges(initialEdges); }, [initialEdges, setEdges]);
    const onConnect = (_connection: { source: string | null; target: string | null }) => { setShowForm(false); };
    const onDropDevice = (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        const deviceId = event.dataTransfer.getData('application/netatlas-device');
        const device = devices.find((item) => String(item.id) === deviceId);
        if (!device || nodes.some((node) => node.id === deviceId)) return;
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        setNodes((current) => [...current, { id: deviceId, type: 'device', data: { device }, position }]);
        const placedIds = new Set([...nodes.map((node) => node.id), deviceId]);
        setEdges((current) => [
            ...current,
            ...links
                .filter((link) => placedIds.has(String(link.source_interface.device.id)) && placedIds.has(String(link.target_interface.device.id)) && !current.some((edge) => edge.id === String(link.id)))
                .map((link) => ({
                    id: String(link.id),
                    source: String(link.source_interface.device.id),
                    target: String(link.target_interface.device.id),
                    label: `${link.source_interface.name} — ${link.target_interface.name}`,
                    style: { stroke: link.status === 'active' ? '#2563eb' : link.status === 'inactive' ? '#94a3b8' : '#ca8a04' },
                    data: { linkId: link.id },
                })),
        ]);
        router.put('/network-topology/positions', { device_id: device.id, position_x: position.x, position_y: position.y }, { preserveScroll: true });
        setSelectedLink(null);
    };
    const onNodeDragStop = (_: unknown, node: Node) => { router.put('/network-topology/positions', { device_id: Number(node.id), position_x: node.position.x, position_y: node.position.y }, { preserveScroll: true }); };
    const filtered = devices.filter((device) => device.name.toLowerCase().includes(search.toLowerCase()) || device.device_type.includes(search.toLowerCase()));
    return <><Head title="Network Topology" /><main className="h-[calc(100vh-2rem)] min-h-150 p-5 text-slate-800"><div className="mb-4 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-800">Network Topology</h1><p className="text-sm text-slate-500">Visualize and manage your physical network connections.</p></div><button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={() => setShowForm(false)}>Add connection</button></div>{devices.length === 0 ? <div className="rounded-xl border bg-white p-8 text-center shadow-sm"><p className="font-medium">No devices available yet.</p><Link className="mt-2 inline-block text-blue-600" href="/devices/create">Add a device in Network Inventory</Link></div> : <div className="grid h-[calc(100%-5rem)] grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_300px]"><aside className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="font-semibold">Devices</h2><input className="mt-3 w-full rounded border p-2 text-sm" placeholder="Search devices" value={search} onChange={(e) => setSearch(e.target.value)} />{filtered.map((device) => <button key={device.id} className={`mt-2 block w-full rounded-lg p-2 text-left hover:bg-blue-50 ${selectedSidebarDevice === device.id ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`} draggable onClick={() => { setSelectedSidebarDevice(device.id); setSelectedLink(null); }} onDragStart={(event) => { event.dataTransfer.setData('application/netatlas-device', String(device.id)); event.dataTransfer.effectAllowed = 'copy'; setSelectedSidebarDevice(device.id); }}><p className="font-medium">{device.name}</p><p className="text-xs text-slate-500 capitalize">{device.device_type.replaceAll('_', ' ')}</p></button>)}</aside><section className="overflow-hidden rounded-xl border bg-slate-50 shadow-sm" onDragOver={(event) => event.preventDefault()} onDrop={onDropDevice}><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => { setSelectedDevice((node.data as DeviceNodeData).device); setSelectedLink(null); }} onEdgeClick={(_, edge) => { setSelectedDevice(null); setSelectedLink(links.find((link) => link.id === edge.data?.linkId) ?? null); }} onNodeDragStop={onNodeDragStop} onNodeDoubleClick={(_, node) => { setSelectedDevice((node.data as DeviceNodeData).device); setSelectedLink(null); }} onEdgeDoubleClick={(_, edge) => { setSelectedDevice(null); setSelectedLink(links.find((link) => link.id === edge.data?.linkId) ?? null); }} zoomOnDoubleClick={false} connectOnClick={false} fitView><Background /><Controls /><MiniMap /></ReactFlow>{nodes.length === 0 && <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 rounded bg-white p-3 text-sm text-slate-500 shadow">No connections yet. Add one using actual device interfaces.</p>}</section><aside className="max-h-full overflow-y-auto rounded-xl border bg-white p-4 shadow-sm">{selectedDevice ? <DeviceDetails device={selectedDevice} links={links} onConnect={() => setShowForm(false)} /> : selectedLink ? <ConnectionDetails link={selectedLink} onEdit={() => setShowForm(true)} onDelete={() => confirm('Delete this connection?') && router.delete(`/network-topology/links/${selectedLink.id}`)} /> : <p className="text-sm text-slate-500">Select a canvas device or connection to view details.</p>}</aside></div>}</main>{showForm && <div className="hidden" onDoubleClick={(event) => event.stopPropagation()} onClick={() => { setShowForm(false); setSelectedLink(null); }}><div className="w-full rounded-xl bg-white p-5 text-slate-800 shadow-xl" onClick={(event) => event.stopPropagation()} style={{ width: 'min(100%, 28rem)', maxHeight: '90vh', overflowY: 'auto' }}><ConnectionForm devices={devices} link={selectedLink ?? undefined} onClose={() => { setShowForm(false); setSelectedLink(null); }} /></div></div>}</>;
}

export default function Topology(props: { devices: Device[]; links: Link[] }) {
    return <ReactFlowProvider><TopologyCanvas {...props} /></ReactFlowProvider>;
}
