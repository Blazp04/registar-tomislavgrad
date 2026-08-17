import type * as React from "react";
import { ClipboardListIcon, GraduationCapIcon, LayoutDashboardIcon, ScrollTextIcon, Settings2Icon, UsersIcon } from "lucide-react";
import { Link } from "react-router";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";

const navMain = [
  { title: "Dashboard", url: "/admin", icon: <LayoutDashboardIcon /> },
  { title: "Studenti", url: "/admin/students", icon: <UsersIcon /> },
  { title: "GDPR zahtjevi", url: "/admin/data-requests", icon: <ClipboardListIcon /> },
  { title: "Šifrarnici", url: "/admin/codebooks", icon: <Settings2Icon /> },
  { title: "Audit zapisi", url: "/admin/audit-logs", icon: <ScrollTextIcon /> },
];

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: { name: string; email: string } }) {
  return <Sidebar collapsible="icon" {...props}>
    <SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" asChild><Link to="/admin"><div className="grid aspect-square size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><GraduationCapIcon className="size-5" /></div><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-semibold">Registar</span><span className="truncate text-xs">Administracija</span></div></Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
    <SidebarContent><NavMain items={navMain} /></SidebarContent>
    <SidebarFooter><NavUser user={{ ...user, avatar: "" }} /></SidebarFooter><SidebarRail />
  </Sidebar>;
}
