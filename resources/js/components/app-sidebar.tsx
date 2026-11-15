import { Link, usePage } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import { Activity, Boxes, LayoutDashboard, Network, Settings2 } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutDashboard,
        },
        {
            title: 'Network Inventory',
            href: '/devices',
            icon: Boxes,
        },
        {
            title: 'Network Topology',
            href: '/network-topology',
            icon: Network,
        },
        {
            title: 'Network Monitoring',
            href: '/network-monitoring',
            icon: Activity,
        },
    ];

    const utilityNavItems: NavItem[] = [
        {
            title: 'Settings',
            href: '/settings/profile',
            icon: Settings2,
        },
    ];

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-[#173b69] bg-[#0b2347]"
            style={{
                '--sidebar': '#0b2347',
                '--sidebar-foreground': '#dcecff',
                '--sidebar-primary': '#7ab4ff',
                '--sidebar-primary-foreground': '#0b2347',
                '--sidebar-accent': '#173b69',
                '--sidebar-accent-foreground': '#ffffff',
                '--sidebar-border': '#294c79',
            } as CSSProperties}
        >
            <SidebarHeader className="p-4 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-14 rounded-2xl px-2 hover:bg-[#173b69]">
                            <Link href={dashboardUrl} prefetch>
                                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#7ab4ff] text-[#0b2347] shadow-[0_8px_18px_rgba(122,180,255,0.25)]"><Network className="size-5" strokeWidth={2.3} /><span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#74e0ad] ring-2 ring-[#0b2347]" /></span>
                                <span className="ml-1 grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden"><span className="truncate text-[15px] font-extrabold tracking-[0.15em] text-white">NETATLAS</span><span className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8eb2dc]">Network intelligence</span></span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator className="mx-4 w-auto bg-[#294c79]" />

            <SidebarContent className="px-2 pt-3">
                <NavMain items={mainNavItems} />
                <SidebarGroup className="mt-auto px-2 py-4">
                    <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7194bc]">Workspace</SidebarGroupLabel>
                    <SidebarMenu>{utilityNavItems.map((item) => <SidebarMenuItem key={item.title}><SidebarMenuButton asChild tooltip={{ children: item.title }} className="h-10 rounded-xl text-[#9fb9d8] hover:bg-[#173b69] hover:text-white"><Link href={item.href} prefetch>{item.icon && <item.icon className="size-[18px]" />}<span>{item.title}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>
                </SidebarGroup>
                <div className="mx-2 mb-3 rounded-2xl border border-[#315681] bg-[#102e59] p-3 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-lg bg-[#1d4b82] text-[#82baff]"><Activity className="size-4" /></span><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b8d6fa]">Network status</span></div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#c7d8ed]"><span className="size-2 rounded-full bg-[#74e0ad] shadow-[0_0_0_4px_rgba(116,224,173,0.12)]" /> Monitoring ready</div>
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-[#294c79] p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
