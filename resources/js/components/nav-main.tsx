import { Link } from "@inertiajs/react";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCurrentUrl } from "@/hooks/use-current-url";
import type { NavItem } from "@/types";

export const NAV_LABEL_CLASS =
    "px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";

export const NAV_ITEM_CLASS =
    "h-10 gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-blue-700 data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:shadow-blue-700/20";

export function NavMain({ items }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-3 py-0">
            <SidebarGroupLabel className={NAV_LABEL_CLASS}>
                Operations
            </SidebarGroupLabel>
            <SidebarMenu className="mt-1 gap-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className={NAV_ITEM_CLASS}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span className="truncate">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
