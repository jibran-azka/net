import { Head, Link, router, useForm } from '@inertiajs/react';
import { Background, Controls, Handle, MiniMap, Position, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react';
import { Network, Router, Server, Shield, Wifi } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import '@xyflow/react/dist/style.css';

type Interface = { id: number; name: string; mac_address: string | null; description: string | null };
type Device = { id: number; name: string; hostname: string | null; device_type: string; vendor: string | null; model: string | null; location: string | null; lifecycle_status: string; interfaces: Interface[]; ip_addresses: { address: string; is_primary: boolean }[]; topology_positions: { position_x: number; position_y: number }[] };
type DeviceLink = { id: number; source_interface_id: number; target_interface_id: number; connection_type: string; label: string | null; status: string; notes: string | null; source_interface: Interface & { device: Device }; target_interface: Interface & { device: Device } };
type DeviceNodeData = { device: Device };

const iconFor = (type: string) => ({ router: Router, server: Server, firewall: Shield, access_point: Wifi }[type] ?? Network);
const linkEdge = (link: DeviceLink): Edge => ({ id: String(link.id), source: String(link.source_interface.device.id), target: String(link.target_interface.device.id), label: `${link.source_interface.name} — ${link.target_interface.name}${link.label ? ` · ${link.label}` : ''}`, style: { stroke: link.status === 'active' ? '#2563eb' : link.status === 'inactive' ? '#94a3b8' : '#ca8a04' }, data: { linkId: link.id } });

function DeviceNode({ data }: NodeProps<Node<DeviceNodeData>>) {
    const { device } = data; const Icon = iconFor(device.device_type);
    return <div className="min-w-48 rounded-xl border border-blue-200 bg-white p-3 shadow-sm"><Handle type="target" position={Position.Top} /><div className="flex items-center gap-2"><span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Icon size={18} /></span><div><p className="font-semibold text-slate-800">{device.name}</p><p className="text-xs capitalize text-slate-500">{device.device_type.replaceAll('_', ' ')}</p></div></div><p className="mt-2 text-xs text-slate-500">{device.ip_addresses.find((ip) => ip.is_primary)?.address ?? device.ip_addresses[0]?.address ?? 'No primary IP'}</p><Handle type="source" position={Position.Bottom} /></div>;
}
const nodeTypes = { device: DeviceNode };

function DeviceDetailPanel({ device, links, onConnect }: { device: Device; links: DeviceLink[]; onConnect: () => void }) {
    const Icon = iconFor(device.device_type);
    const primaryIp = device.ip_addresses.find((ip) => ip.is_primary)?.address ?? device.ip_addresses[0]?.address;
    const deviceLinks = links.filter((link) => link.source_interface.device.id === device.id || link.target_interface.device.id === device.id);
    const info = [
        ['Hostname', device.hostname],
        ['Device Type', device.device_type.replaceAll('_', ' ')],
        ['Vendor', device.vendor],
        ['Model', device.model],
        ['Location', device.location],
        ['Primary IP', primaryIp],
    ];

    return <div className="space-y-4 text-slate-800">
        <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Device Details</h2><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Selected</span></div>
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4"><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={21}/></span><div><p className="font-medium">{device.name}</p><p className="text-xs capitalize text-slate-500">{device.device_type.replaceAll('_', ' ')}</p><span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">{device.lifecycle_status}</span></div></div>
        <section><h3 className="mb-2 text-sm font-semibold">Device Information</h3><div className="divide-y divide-slate-200 border-y border-slate-200 text-xs">{info.map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-3 py-2"><span className="text-slate-500">{label}</span><span>{value || 'Not available'}</span></div>)}</div></section>
        <section className="border-t border-slate-200 pt-4"><h3 className="mb-2 text-sm font-semibold">Network Interfaces</h3>{device.interfaces.length ? <div className="space-y-2">{device.interfaces.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-2"><p className="text-xs font-semibold">{item.name}</p><p className="mt-1 text-[11px] text-slate-500">MAC Address: {item.mac_address || 'Not available'}</p><span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Available</span></div>)}</div> : <p className="text-xs text-slate-500">No interfaces registered.</p>}</section>
        <section className="border-t border-slate-200 pt-4"><h3 className="mb-2 text-sm font-semibold text-slate-800">Connections</h3>{deviceLinks.length ? <div className="space-y-2">{deviceLinks.map((link) => <div key={link.id} className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-xs"><p className="font-medium text-slate-700">{link.source_interface.device.name} · {link.source_interface.name}</p><p className="text-slate-500">to {link.target_interface.device.name} · {link.target_interface.name}</p></div>)}</div> : <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">No connections for this device yet.</p>}</section>
        <button type="button" className="w-full rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700" onClick={onConnect}>Connect Interface</button>
        <Link className="block w-full rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-blue-700 transition hover:bg-blue-100" href={`/devices/${device.id}`}>View Device Details</Link>
        <p className="text-[11px] text-slate-400">Panel detail perangkat dari data inventory.</p>
    </div>;
}

function ConnectionForm({ devices, link, onClose }: { devices: Device[]; link?: DeviceLink; onClose: () => void }) {
    const form = useForm({ source_interface_id: String(link?.source_interface_id ?? ''), target_interface_id: String(link?.target_interface_id ?? ''), connection_type: link?.connection_type ?? 'ethernet', label: link?.label ?? '', status: link?.status ?? 'active', notes: link?.notes ?? '' });
    useEffect(() => { const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [onClose]);
    const interfaces = devices.flatMap((device) => device.interfaces.map((item) => ({ ...item, device })));
    const submit = (event: React.FormEvent) => { event.preventDefault(); const options = { onSuccess: onClose }; link ? form.put(`/network-topology/links/${link.id}`, options) : form.post('/network-topology/links', options); };
    return <form onSubmit={submit} className="space-y-3"><h2 className="text-lg font-semibold">{link ? 'Edit Connection' : 'Add Connection'}</h2><p className="text-xs text-slate-500">Pilih interface dari perangkat asal dan perangkat tujuan yang sudah terdaftar di inventory.</p><select required className="w-full rounded border p-2" value={form.data.source_interface_id} onChange={(event) => form.setData('source_interface_id', event.target.value)}><option value="">Source interface</option>{interfaces.map((item) => <option key={item.id} value={item.id}>{item.device.name} — {item.name}</option>)}</select><select required className="w-full rounded border p-2" value={form.data.target_interface_id} onChange={(event) => form.setData('target_interface_id', event.target.value)}><option value="">Target interface</option>{interfaces.map((item) => <option key={item.id} value={item.id}>{item.device.name} — {item.name}</option>)}</select><div className="grid grid-cols-2 gap-2"><select className="rounded border p-2" value={form.data.connection_type} onChange={(event) => form.setData('connection_type', event.target.value)}>{['ethernet', 'fiber', 'wireless', 'serial', 'other'].map((item) => <option key={item}>{item}</option>)}</select><select className="rounded border p-2" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>{['active', 'inactive', 'unknown'].map((item) => <option key={item}>{item}</option>)}</select></div><input className="w-full rounded border p-2" placeholder="Label (optional)" value={form.data.label} onChange={(event) => form.setData('label', event.target.value)} /><textarea className="w-full rounded border p-2" placeholder="Notes (optional)" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />{Object.entries(form.errors).map(([field, error]) => <p key={field} className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>)}<div className="flex justify-end gap-2"><button type="button" className="rounded border px-3 py-2" onClick={onClose}>Cancel</button><button className="rounded bg-blue-600 px-3 py-2 text-white" disabled={form.processing}>Save connection</button></div></form>;
}

function DraggableConnectionDialog({ devices, link, onClose }: { devices: Device[]; link: DeviceLink | null; onClose: () => void }) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        drag.current = { pointerId: event.pointerId, x: event.clientX - offset.x, y: event.clientY - offset.y };
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!drag.current || drag.current.pointerId !== event.pointerId) return;
        setOffset({ x: event.clientX - drag.current.x, y: event.clientY - drag.current.y });
    };
    const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
        if (drag.current?.pointerId === event.pointerId) drag.current = null;
    };
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="w-full rounded-xl bg-white text-slate-800 shadow-xl" onClick={(event) => event.stopPropagation()} style={{ width: 'min(100%, 28rem)', maxHeight: '90vh', overflowY: 'auto', transform: `translate(${offset.x}px, ${offset.y}px)` }}>
            <div className="flex cursor-move items-center justify-between border-b border-slate-200 px-5 py-3 select-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={stopDragging} onPointerCancel={stopDragging}>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{link ? 'Edit Connection' : 'Add Connection'}</span>
                <button type="button" className="cursor-pointer rounded px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onPointerDown={(event) => event.stopPropagation()} onClick={onClose} aria-label="Close connection form">×</button>
            </div>
            <div className="p-5"><ConnectionForm devices={devices} link={link ?? undefined} onClose={onClose} /></div>
        </div>
    </div>;
}

function TopologyCanvas({ devices, links }: { devices: Device[]; links: DeviceLink[] }) {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null); const [selectedLink, setSelectedLink] = useState<DeviceLink | null>(null); const [showForm, setShowForm] = useState(false); const [search, setSearch] = useState(''); const { screenToFlowPosition } = useReactFlow();
    const selectNode = (node: Node) => {
        const device = devices.find((item) => String(item.id) === String(node.id));
        if (!device) return;
        setSelectedDevice(device);
        setSelectedLink(null);
        setShowForm(false);
    };
    const initialNodes = useMemo<Node<DeviceNodeData>[]>(() => devices.flatMap((device) => device.topology_positions[0] ? [{ id: String(device.id), type: 'device', data: { device }, position: { x: device.topology_positions[0].position_x, y: device.topology_positions[0].position_y } }] : []), [devices]);
    const initialEdges = useMemo(() => links.filter((link) => initialNodes.some((node) => node.id === String(link.source_interface.device.id)) && initialNodes.some((node) => node.id === String(link.target_interface.device.id))).map(linkEdge), [links, initialNodes]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes); const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    useEffect(() => { setEdges(initialEdges); }, [initialEdges, setEdges]);
    const closeForm = () => { setShowForm(false); setSelectedLink(null); };
    const newConnection = () => { setSelectedLink(null); setShowForm(true); };
    const onDrop = (event: React.DragEvent<HTMLElement>) => { event.preventDefault(); const id = event.dataTransfer.getData('application/netatlas-device'); const device = devices.find((item) => String(item.id) === id); if (!device || nodes.some((node) => node.id === id)) return; const position = screenToFlowPosition({ x: event.clientX, y: event.clientY }); setNodes((current) => [...current, { id, type: 'device', data: { device }, position }]); router.put('/network-topology/positions', { device_id: device.id, position_x: position.x, position_y: position.y }, { preserveScroll: true }); };
    const filtered = devices.filter((device) => device.name.toLowerCase().includes(search.toLowerCase()) || device.device_type.includes(search.toLowerCase()));
    return <><Head title="Network Topology" /><main className="h-[calc(100vh-2rem)] min-h-150 p-5 text-slate-800"><div className="mb-4 flex items-center justify-between"><div><h1 className="text-2xl font-bold">Network Topology</h1><p className="text-sm text-slate-500">Visualize and manage your physical network connections.</p></div><button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={newConnection}>Add connection</button></div>{devices.length === 0 ? <div className="rounded-xl border bg-white p-8 text-center shadow-sm"><p className="font-medium">No devices available yet.</p><Link className="mt-2 inline-block text-blue-600" href="/devices/create">Add a device in Network Inventory</Link></div> : <div className="grid h-[calc(100%-5rem)] grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_300px]"><aside className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="font-semibold">Devices</h2><input className="mt-3 w-full rounded border p-2 text-sm" placeholder="Search devices" value={search} onChange={(event) => setSearch(event.target.value)} />{filtered.map((device) => <button key={device.id} className="mt-2 block w-full rounded-lg p-2 text-left hover:bg-blue-50" draggable onDragStart={(event) => { event.dataTransfer.setData('application/netatlas-device', String(device.id)); event.dataTransfer.effectAllowed = 'copy'; }}><p className="font-medium">{device.name}</p><p className="text-xs capitalize text-slate-500">{device.device_type.replaceAll('_', ' ')}</p></button>)}</aside><section className="relative overflow-hidden rounded-xl border bg-slate-50 shadow-sm" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={(_, node) => selectNode(node)} onEdgeClick={(_, edge) => { setSelectedDevice(null); setSelectedLink(links.find((link) => link.id === edge.data?.linkId) ?? null); }} onNodeDragStop={(_, node) => router.put('/network-topology/positions', { device_id: Number(node.id), position_x: node.position.x, position_y: node.position.y }, { preserveScroll: true })} onNodeDoubleClick={(_, node) => selectNode(node)} zoomOnDoubleClick={false} connectOnClick={false} fitView><Background /><Controls /><MiniMap /></ReactFlow>{nodes.length === 0 && <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 rounded bg-white p-3 text-sm text-slate-500 shadow">Drag devices here to build your topology.</p>}</section><aside className="max-h-full overflow-y-auto rounded-xl border bg-white p-4 shadow-sm">{selectedDevice ? <DeviceDetailPanel device={selectedDevice} links={links} onConnect={newConnection} /> : selectedLink ? <div className="space-y-4"><h2 className="font-semibold">Connection Details</h2><p className="text-sm">{selectedLink.source_interface.device.name} · {selectedLink.source_interface.name}<br />to {selectedLink.target_interface.device.name} · {selectedLink.target_interface.name}</p><p className="text-sm capitalize text-slate-500">{selectedLink.connection_type} · {selectedLink.status}</p><button className="text-sm text-blue-600" onClick={() => setShowForm(true)}>Edit connection</button><button className="ml-4 text-sm text-red-600" onClick={() => confirm('Delete this connection?') && router.delete(`/network-topology/links/${selectedLink.id}`)}>Delete connection</button></div> : <p className="text-sm text-slate-500">Select a canvas device or connection to view details.</p>}</aside></div>}</main>{showForm && <DraggableConnectionDialog devices={devices} link={selectedLink} onClose={closeForm} />}</>;
}

export default function Topology(props: { devices: Device[]; links: DeviceLink[] }) { return <ReactFlowProvider><TopologyCanvas {...props} /></ReactFlowProvider>; }
