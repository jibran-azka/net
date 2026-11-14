import { Link, usePage } from '@inertiajs/react';
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
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-[#dce7f5] bg-white">
            <SidebarHeader className="p-4 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-12 rounded-xl px-2 hover:bg-[#f1f6fd]">
                            <Link href={dashboardUrl} prefetch>
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#1769e8] text-white shadow-[0_8px_18px_rgba(23,105,232,0.24)]"><Network className="size-5" strokeWidth={2.3} /></span>
                                <span className="ml-1 grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden"><span className="truncate text-[15px] font-extrabold tracking-[0.12em] text-[#10213e]">NETATLAS</span><span className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.13em] text-[#7b8da5]">Network operations</span></span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator className="mx-4 w-auto bg-[#e7eef7]" />

            <SidebarContent className="px-2 pt-3">
                <NavMain items={mainNavItems} />
                <SidebarGroup className="mt-auto px-2 py-4">
                    <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a9bb0]">Workspace</SidebarGroupLabel>
                    <SidebarMenu>{utilityNavItems.map((item) => <SidebarMenuItem key={item.title}><SidebarMenuButton asChild tooltip={{ children: item.title }} className="h-10 rounded-lg text-[#53637a] hover:bg-[#f1f6fd] hover:text-[#1769e8]"><Link href={item.href} prefetch>{item.icon && <item.icon className="size-[18px]" />}<span>{item.title}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-[#e7eef7] p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
