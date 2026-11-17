import { Head, Link, router } from "@inertiajs/react";
import {
    Activity,
    Box,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Gauge,
    Layers,
    MoreHorizontal,
    Server,
    TriangleAlert,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import PendingInvitationsModal from "@/components/pending-invitations-modal";
import { dashboard } from "@/routes";
import type { DashboardInvitation } from "@/types";

type Result = {
    checkedAt: string;
    latency: number | null;
    packetLoss: number | null;
    status: string;
};
type Health = Result & { id: number; name: string; deviceType: string };
type ActivityItem = Result & {
    id: number;
    deviceId: number;
    deviceName: string;
    deviceType: string;
};
type Props = {
    pendingInvitations?: DashboardInvitation[];
    period: string;
    overview: {
        total: number;
        online: number;
        offline: number;
        notMonitored: number;
        deviceTypes: number;
    };
    availability: { onlineChecks: number; totalChecks: number };
    distribution: { name: string; value: number }[];
    history: Result[];
    health: Health[];
    healthPagination: {
        currentPage: number;
        lastPage: number;
        total: number;
    };
    recentActivity: ActivityItem[];
    recentActivityPagination: {
        currentPage: number;
        lastPage: number;
        total: number;
    };
};

const SERIF = "'Playfair Display', Georgia, serif";
const BLUE = "#1d4ed8";
const TRACK = "#e2e8f0";
const CARD = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
// Blue ramp shared by every chart so that all series read as one system.
const SHADES = [
    "#1e3a8a",
    "#2563eb",
    "#60a5fa",
    "#93c5fd",
    "#bfdbfe",
    "#dbeafe",
];
const periods = [
    { value: "1h", label: "Last 1 Hour" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
];

const statusClass = (status: string) =>
    status === "online"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
        : status === "offline"
          ? "bg-rose-50 text-rose-600 ring-rose-600/20"
          : "bg-slate-100 text-slate-600 ring-slate-500/20";
const statusLabel = (status: string) =>
    status === "online"
        ? "Online"
        : status === "offline"
          ? "Offline"
          : "Not monitored";
const dateTime = (date: string | null) =>
    date ? new Date(date).toLocaleString() : "Never";
const deviceTypeLabel = (value: string) =>
    value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
const chartTime = (date: string, period: string) => {
    const value = new Date(date);

    return period === "7d" || period === "30d"
        ? value.toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}
        >
            {statusLabel(status)}
        </span>
    );
}

function MoreMenu() {
    return <MoreHorizontal size={18} className="shrink-0 text-slate-400" />;
}

function MetricCard({
    title,
    value,
    note,
    icon,
    tone,
}: {
    title: string;
    value: number;
    note: string;
    icon: React.ReactNode;
    tone: string;
}) {
    return (
        <section className={`${CARD} flex items-start gap-4 p-5`}>
            <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
            >
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                    {value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{note}</p>
            </div>
        </section>
    );
}

function ChartHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="mb-5 flex items-start justify-between gap-4">
            <div>
                <div className="flex items-center gap-2.5">
                    <span className="h-0.5 w-5 rounded-full bg-blue-700" />
                    <h2
                        className="text-xl leading-snug tracking-normal text-slate-900"
                        style={{ fontFamily: SERIF, fontWeight: 700 }}
                    >
                        {title}
                    </h2>
                </div>
                <p className="mt-1 pl-[30px] text-xs text-slate-500">
                    {description}
                </p>
            </div>
            <MoreMenu />
        </div>
    );
}

function PanelHeader({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    {icon}
                </span>
                <div className="min-w-0">
                    <h2
                        className="text-2xl leading-tight tracking-normal text-slate-900"
                        style={{ fontFamily: SERIF, fontWeight: 700 }}
                    >
                        {title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            <MoreMenu />
        </div>
    );
}

function EmptyChart() {
    return (
        <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <Activity size={28} className="mb-2" />
            <p className="text-sm font-medium">
                No monitoring data in this period
            </p>
            <p className="mt-1 text-xs">
                Run an ICMP check to populate the history.
            </p>
        </div>
    );
}

function LatencyChart({ data }: { data: (Result & { time: string })[] }) {
    return (
        <div className="h-60">
            {data.length ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ left: 0, right: 8, top: 8 }}
                    >
                        <defs>
                            <linearGradient
                                id="latencyFill"
                                x1="0"
                                x2="0"
                                y1="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={BLUE}
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={BLUE}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={40}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            width={56}
                            tickFormatter={(value) => `${value} ms`}
                        />
                        <Tooltip
                            formatter={(value) => [
                                `${Number(value).toFixed(2)} ms`,
                                "Latency",
                            ]}
                            labelStyle={{ color: "#334155" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="latency"
                            stroke={BLUE}
                            strokeWidth={2}
                            fill="url(#latencyFill)"
                            connectNulls
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <EmptyChart />
            )}
        </div>
    );
}

function PacketLossChart({ data }: { data: (Result & { time: string })[] }) {
    return (
        <div className="h-60">
            {data.length ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ left: 0, right: 8, top: 8 }}
                    >
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={40}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            width={44}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            formatter={(value) => [
                                `${Number(value).toFixed(2)}%`,
                                "Packet loss",
                            ]}
                            labelStyle={{ color: "#334155" }}
                            cursor={{ fill: "#eff6ff" }}
                        />
                        <Bar
                            dataKey="packetLoss"
                            fill={BLUE}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={18}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <EmptyChart />
            )}
        </div>
    );
}

function AvailabilityRing({ percent }: { percent: number | null }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const value = percent ?? 0;

    return (
        <div className="relative flex size-44 shrink-0 items-center justify-center">
            <svg viewBox="0 0 140 140" className="size-full -rotate-90">
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={TRACK}
                    strokeWidth="12"
                />
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={BLUE}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - value / 100)}
                    className="transition-all"
                />
            </svg>
            <div className="absolute text-center">
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {percent === null ? "-" : `${percent.toFixed(1)}%`}
                </p>
                <p className="text-xs text-slate-500">Availability</p>
            </div>
        </div>
    );
}

function DeviceDistribution({
    distribution,
}: {
    distribution: { name: string; value: number }[];
}) {
    if (!distribution.length) {
        return <EmptyChart />;
    }

    const maximum = Math.max(...distribution.map((item) => item.value), 1);

    return (
        <div>
            <div
                className={
                    distribution.length > 5
                        ? "max-h-64 space-y-5 overflow-y-auto pr-2"
                        : "space-y-5"
                }
            >
                {distribution.map((item, index) => (
                    <div
                        key={item.name}
                        className="grid grid-cols-[96px_1fr_auto] items-center gap-4"
                    >
                        <span
                            className="truncate text-sm font-medium text-slate-700"
                            title={deviceTypeLabel(item.name)}
                        >
                            {deviceTypeLabel(item.name)}
                        </span>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${Math.max((item.value / maximum) * 100, 4)}%`,
                                    backgroundColor:
                                        SHADES[index % SHADES.length],
                                }}
                            />
                        </div>
                        <span className="min-w-6 text-right text-sm font-semibold text-slate-900">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
            <p className="pt-5 text-xs text-slate-400">Number of devices</p>
        </div>
    );
}

export default function Dashboard({
    pendingInvitations = [],
    period,
    overview,
    availability,
    distribution,
    history,
    health,
    healthPagination,
    recentActivity,
    recentActivityPagination,
}: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const availabilityPercent = availability.totalChecks
        ? (availability.onlineChecks / availability.totalChecks) * 100
        : null;
    const chartData = history.map((row) => ({
        ...row,
        time: chartTime(row.checkedAt, period),
    }));

    const setPeriod = (value: string) =>
        router.get(
            window.location.pathname,
            { period: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const setActivityPage = (page: number) =>
        router.get(
            window.location.pathname,
            {
                period,
                activity_page: page,
                health_page: healthPagination.currentPage,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    const setHealthPage = (page: number) =>
        router.get(
            window.location.pathname,
            {
                period,
                activity_page: recentActivityPagination.currentPage,
                health_page: page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    return (
        <>
            <Head title="Infrastructure Dashboard" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <main className="min-h-0 flex-1 bg-slate-50 p-4 pb-12 text-slate-900 md:p-8">
                <div className="space-y-6">
                    <header className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">
                                Topoly NOC
                            </p>
                            <h1
                                className="mt-3 text-4xl leading-tight tracking-normal text-slate-900 md:text-5xl"
                                style={{ fontFamily: SERIF, fontWeight: 700 }}
                            >
                                Infrastructure{" "}
                                <span className="italic text-blue-700">
                                    Dashboard
                                </span>
                            </h1>
                            <p
                                className="mt-3 text-base italic text-slate-500"
                                style={{ fontFamily: SERIF }}
                            >
                                A centralized view of your network inventory and
                                ICMP health.
                            </p>
                        </div>
                        <div className="relative">
                            <select
                                value={period}
                                onChange={(event) =>
                                    setPeriod(event.target.value)
                                }
                                className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-sm font-medium text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {periods.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={16}
                                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500"
                            />
                        </div>
                    </header>

                    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                        <MetricCard
                            title="Total Devices"
                            value={overview.total}
                            note="Devices in your inventory"
                            icon={<Layers size={20} />}
                            tone="bg-blue-50 text-blue-600"
                        />
                        <MetricCard
                            title="Online Devices"
                            value={overview.online}
                            note="Latest check is online"
                            icon={<CheckCircle2 size={20} />}
                            tone="bg-emerald-50 text-emerald-600"
                        />
                        <MetricCard
                            title="Offline Devices"
                            value={overview.offline}
                            note="Latest check is offline"
                            icon={<XCircle size={20} />}
                            tone="bg-rose-50 text-rose-600"
                        />
                        <MetricCard
                            title="Not Monitored"
                            value={overview.notMonitored}
                            note="No result has been recorded"
                            icon={<TriangleAlert size={20} />}
                            tone="bg-amber-50 text-amber-600"
                        />
                        <MetricCard
                            title="Device Types"
                            value={overview.deviceTypes}
                            note="Distinct device categories"
                            icon={<Box size={20} />}
                            tone="bg-violet-50 text-violet-600"
                        />
                    </section>

                    <section className="grid gap-5 2xl:grid-cols-2">
                        <div className={`${CARD} min-w-0`}>
                            <ChartHeader
                                title="Latency History"
                                description="Based on actual ICMP checks in the selected period."
                            />
                            <LatencyChart data={chartData} />
                        </div>
                        <div className={`${CARD} min-w-0`}>
                            <ChartHeader
                                title="Packet Loss History"
                                description="Based on actual ICMP checks in the selected period."
                            />
                            <PacketLossChart data={chartData} />
                        </div>
                    </section>

                    <section className="grid gap-5 2xl:grid-cols-[1fr_1.2fr]">
                        <div className={CARD}>
                            <ChartHeader
                                title="Availability"
                                description="Online checks / all actual checks in this period."
                            />
                            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
                                <AvailabilityRing
                                    percent={availabilityPercent}
                                />
                                <div className="w-full max-w-60 space-y-3 text-sm">
                                    <div className="flex items-center justify-between gap-6">
                                        <span className="flex items-center gap-2.5 text-slate-700">
                                            <span className="size-2.5 rounded-full bg-emerald-500" />
                                            Online Checks
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {availability.totalChecks
                                                ? availability.onlineChecks
                                                : 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6">
                                        <span className="flex items-center gap-2.5 text-slate-700">
                                            <span className="size-2.5 rounded-full bg-blue-600" />
                                            Offline Checks
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {availability.totalChecks -
                                                availability.onlineChecks}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6 border-t border-slate-200 pt-3">
                                        <span className="text-slate-500">
                                            Total Checks
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {availability.totalChecks}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-6 text-xs leading-5 text-slate-500">
                                Periods without recorded checks are excluded;
                                they are never treated as online.
                            </p>
                        </div>

                        <div className={CARD}>
                            <ChartHeader
                                title="Device Distribution"
                                description="Inventory grouped by device type."
                            />
                            <DeviceDistribution distribution={distribution} />
                        </div>
                    </section>

                    <section className="grid gap-5 2xl:grid-cols-[1.45fr_1fr]">
                        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="px-6 pt-6">
                                <PanelHeader
                                    title="Device Health"
                                    description="Offline devices and devices without a recorded check."
                                    icon={<TriangleAlert size={18} />}
                                />
                            </div>
                            {health.length ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[560px] text-left text-sm">
                                        <thead className="bg-slate-50 text-xs text-slate-500">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">
                                                    Device
                                                </th>
                                                <th className="py-3 font-medium">
                                                    Status
                                                </th>
                                                <th className="py-3 font-medium">
                                                    Latency
                                                </th>
                                                <th className="py-3 font-medium">
                                                    Packet Loss
                                                </th>
                                                <th className="py-3 pr-6 font-medium">
                                                    Last Checked
                                                </th>
                                                <th className="w-10 py-3 pr-4" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {health.map((device) => (
                                                <tr
                                                    key={device.id}
                                                    className="border-t border-slate-200"
                                                >
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            href={`/devices/${device.id}`}
                                                            className="font-semibold text-blue-700 hover:underline"
                                                        >
                                                            {device.name}
                                                        </Link>
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {device.deviceType}
                                                        </p>
                                                    </td>
                                                    <td className="py-4">
                                                        <StatusBadge
                                                            status={
                                                                device.status
                                                            }
                                                        />
                                                    </td>
                                                    <td className="py-4 text-slate-600">
                                                        {device.latency == null
                                                            ? "-"
                                                            : `${device.latency} ms`}
                                                    </td>
                                                    <td className="py-4 text-slate-600">
                                                        {device.packetLoss ==
                                                        null
                                                            ? "-"
                                                            : `${device.packetLoss}%`}
                                                    </td>
                                                    <td className="py-4 pr-6 text-xs text-slate-500">
                                                        {dateTime(
                                                            device.checkedAt,
                                                        )}
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <MoreMenu />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="p-10 text-center text-sm text-slate-500">
                                    All monitored devices are currently online.
                                </p>
                            )}
                            {healthPagination.lastPage > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-xs">
                                    <span className="text-slate-500">
                                        Page {healthPagination.currentPage} of{" "}
                                        {healthPagination.lastPage}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                healthPagination.currentPage <=
                                                1
                                            }
                                            onClick={() =>
                                                setHealthPage(
                                                    healthPagination.currentPage -
                                                        1,
                                                )
                                            }
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            type="button"
                                            disabled={
                                                healthPagination.currentPage >=
                                                healthPagination.lastPage
                                            }
                                            onClick={() =>
                                                setHealthPage(
                                                    healthPagination.currentPage +
                                                        1,
                                                )
                                            }
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`${CARD} min-w-0`}>
                            <PanelHeader
                                title="Recent Monitoring Activity"
                                description="Latest monitoring checks · 5 per page."
                                icon={<Gauge size={18} />}
                            />
                            {recentActivity.length ? (
                                <ul className="divide-y divide-slate-200 border-t border-slate-200">
                                    {recentActivity.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-start justify-between gap-3 py-4"
                                        >
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/network-monitoring/${item.deviceId}`}
                                                    className="block truncate text-sm font-semibold text-blue-700 hover:underline"
                                                >
                                                    {item.deviceName}
                                                </Link>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Latency:{" "}
                                                    {item.latency == null
                                                        ? "-"
                                                        : `${item.latency} ms`}{" "}
                                                    · Loss:{" "}
                                                    {item.packetLoss == null
                                                        ? "-"
                                                        : `${item.packetLoss}%`}{" "}
                                                    · {dateTime(item.checkedAt)}
                                                </p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="p-10 text-center text-sm text-slate-500">
                                    No monitoring activity yet.
                                </p>
                            )}
                            {recentActivityPagination.lastPage > 1 && (
                                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
                                    <span className="text-slate-500">
                                        Page{" "}
                                        {recentActivityPagination.currentPage}{" "}
                                        of {recentActivityPagination.lastPage}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                recentActivityPagination.currentPage <=
                                                1
                                            }
                                            onClick={() =>
                                                setActivityPage(
                                                    recentActivityPagination.currentPage -
                                                        1,
                                                )
                                            }
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            type="button"
                                            disabled={
                                                recentActivityPagination.currentPage >=
                                                recentActivityPagination.lastPage
                                            }
                                            onClick={() =>
                                                setActivityPage(
                                                    recentActivityPagination.currentPage +
                                                        1,
                                                )
                                            }
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: "Dashboard",
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : "/",
        },
    ],
});
