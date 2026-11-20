import { Head, router } from "@inertiajs/react";
import { Bell, CheckCheck, CircleAlert } from "lucide-react";
type Notice = {
    id: string;
    alert_id?: number;
    device_id?: number;
    title?: string;
    message?: string;
    severity?: string;
    read_at: string | null;
    created_at: string;
};
type Page = {
    data: Notice[];
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};
const pageLabel = (label: string) =>
    label.includes("Previous")
        ? "‹ Previous"
        : label.includes("Next")
          ? "Next ›"
          : label;
export default function Notifications({
    notifications,
    filter,
    unreadCount,
}: {
    notifications: Page;
    filter: "all" | "unread";
    unreadCount: number;
}) {
    const date = (v: string) => new Date(v).toLocaleString();
    const read = (n: Notice) =>
        router.patch(
            "/notifications/" + n.id + "/read",
            {},
            { preserveScroll: true },
        );
    return (
        <>
            <Head title="Notifications" />
            <main className="min-h-0 flex-1 bg-slate-50 p-4 pb-12 text-slate-900 md:p-7">
                <header className="mb-7 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="rounded-xl bg-blue-100 p-3 text-blue-600">
                            <Bell size={24} />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Notification Center
                            </h1>
                            <p className="text-sm text-slate-500">
                                Riwayat pemberitahuan gangguan perangkat.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() =>
                            router.patch(
                                "/notifications/read-all",
                                {},
                                { preserveScroll: true },
                            )
                        }
                        disabled={unreadCount === 0}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CheckCheck size={15} /> Mark all as read
                    </button>
                </header>
                <div className="mb-4 flex items-center gap-2">
                    {[
                        { value: "all", label: "All" },
                        { value: "unread", label: `Unread${unreadCount ? ` (${unreadCount})` : ""}` },
                    ].map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() =>
                                router.get("/notifications", { filter: item.value })
                            }
                            className={
                                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors " +
                                (filter === item.value
                                    ? "bg-blue-700 text-white"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                            }
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {notifications.data.length ? (
                        notifications.data.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => read(n)}
                                className={
                                    "flex w-full gap-3 border-b border-slate-100 p-5 text-left hover:bg-blue-50/50 " +
                                    (!n.read_at ? "bg-blue-50/30" : "")
                                }
                            >
                                <span className="rounded-xl bg-red-100 p-2 text-red-600">
                                    <CircleAlert size={19} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-semibold">
                                        {n.title || "Device Offline"}
                                    </span>
                                    <span className="mt-1 block text-sm text-slate-600">
                                        {n.message}
                                    </span>
                                    <span className="mt-2 block text-xs text-slate-400">
                                        {date(n.created_at)} ·{" "}
                                        {n.read_at ? "Dibaca" : "Belum dibaca"}
                                    </span>
                                </span>
                                {!n.read_at && (
                                    <span className="mt-2 size-2 rounded-full bg-blue-600" />
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="p-12 text-center text-sm text-slate-500">
                            {filter === "unread"
                                ? "Tidak ada notifikasi yang belum dibaca."
                                : "Belum ada notifikasi."}
                        </div>
                    )}
                    {notifications.total > 0 && (
                        <div className="flex items-center justify-between p-4 text-xs text-slate-500">
                            <span>
                                Showing {notifications.from || 0}–
                                {notifications.to || 0} of {notifications.total}
                            </span>
                            <div className="flex gap-1">
                                {notifications.links.map((l, i) => (
                                    <button
                                        key={i}
                                        disabled={!l.url || l.active}
                                        onClick={() =>
                                            l.url && router.get(l.url)
                                        }
                                        className={
                                            "rounded px-2 py-1 " +
                                            (l.active
                                                ? "bg-blue-600 text-white"
                                                : "border")
                                        }
                                    >
                                        {pageLabel(l.label)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
