import { Link } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { cn, toUrl } from "@/lib/utils";
import { edit } from "@/routes/profile";
import type { NavItem } from "@/types";

const SERIF = "'Playfair Display', Georgia, serif";

const sidebarNavItems: NavItem[] = [
    { title: "Profile", href: edit(), icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="min-h-0 flex-1 bg-slate-50 p-4 pb-12 text-slate-900 md:p-8">
            <header className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">
                    Workspace
                </p>
                <h1
                    className="mt-2 text-4xl leading-tight text-slate-900 md:text-5xl"
                    style={{ fontFamily: SERIF, fontWeight: 700 }}
                >
                    Settings
                </h1>
                <p
                    className="mt-3 text-base italic text-slate-500"
                    style={{ fontFamily: SERIF }}
                >
                    Manage your profile, security, and workspace preferences.
                </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    <nav className="flex flex-col gap-1" aria-label="Settings">
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        "flex h-10 items-center rounded-xl px-3 text-sm font-medium transition-colors",
                                        active
                                            ? "bg-blue-700 font-semibold text-white shadow-md shadow-blue-700/20"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                    )}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <section className="min-w-0 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    {children}
                </section>
            </div>
        </div>
    );
}
