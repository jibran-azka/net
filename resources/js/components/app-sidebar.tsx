import { Link, usePage } from "@inertiajs/react";
import type { CSSProperties } from "react";
import {
    Activity,
    Boxes,
    CircleAlert,
    LayoutDashboard,
    Network,
    Settings2,
} from "lucide-react";
import {
    NAV_ITEM_CLASS,
    NAV_LABEL_CLASS,
    NavMain,
} from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import type { NavItem } from "@/types";

const SERIF = "'Playfair Display', Georgia, serif";

export function AppSidebar() {
    const page = usePage();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : "/";

    const mainNavItems: NavItem[] = [
        { title: "Dashboard", href: dashboardUrl, icon: LayoutDashboard },
        { title: "Network Inventory", href: "/devices", icon: Boxes },
        { title: "Network Topology", href: "/network-topology", icon: Network },
        {
            title: "Network Monitoring",
            href: "/network-monitoring",
            icon: Activity,
        },
        { title: "Alert Management", href: "/alerts", icon: CircleAlert },
    ];

    const utilityNavItems: NavItem[] = [
        { title: "Settings", href: "/settings/profile", icon: Settings2 },
    ];

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-slate-200 bg-white"
            style={
                {
                    "--sidebar": "#ffffff",
                    "--sidebar-foreground": "#334155",
                    "--sidebar-primary": "#1d4ed8",
                    "--sidebar-primary-foreground": "#ffffff",
                    "--sidebar-accent": "#f1f5f9",
                    "--sidebar-accent-foreground": "#0f172a",
                    "--sidebar-border": "#e2e8f0",
                    "--sidebar-width-icon": "9.5rem",
                } as CSSProperties
            }
        >
            <SidebarHeader className="px-6 pt-7 pb-6 group-data-[collapsible=icon]:px-5">
                <Link
                    href={dashboardUrl}
                    prefetch
                    className="flex flex-col items-start gap-2.5"
                >
                    <span
                        className="whitespace-nowrap text-3xl leading-tight tracking-normal text-slate-900"
                        style={{ fontFamily: SERIF, fontWeight: 700 }}
                    >
                        Topoly
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Network Intelligence
                    </span>
                </Link>
            </SidebarHeader>
            <div className="mx-6 h-px bg-slate-200" />

            <SidebarContent className="pt-5">
                <NavMain items={mainNavItems} />

                <SidebarGroup className="mt-auto px-3 py-2">
                    <SidebarGroupLabel className={NAV_LABEL_CLASS}>
                        Workspace
                    </SidebarGroupLabel>
                    <SidebarMenu className="mt-1 gap-1">
                        {utilityNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: item.title }}
                                    className={NAV_ITEM_CLASS}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <div className="mx-3 mt-4 mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold text-slate-900">
                        Network Status
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className="size-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                        Monitoring ready
                    </p>
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
