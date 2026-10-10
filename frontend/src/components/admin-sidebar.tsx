import type * as React from "react";
import { ChevronsUpDownIcon, ClipboardListIcon, ExternalLinkIcon, LayoutDashboardIcon, LogOutIcon, ScrollTextIcon, Settings2Icon, UsersIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useDataRequests } from "@/services/admin";
import { useLogout } from "@/services/auth";
import { BrandMark } from "@/components/brand";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { initials } from "@/lib/utils";

type NavItem = { title: string; url: string; icon: React.ComponentType; exact?: boolean; pendingRequests?: boolean };

const groups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Registar",
    items: [
      { title: "Pregled", url: "/admin", icon: LayoutDashboardIcon, exact: true },
      { title: "Studenti", url: "/admin/students", icon: UsersIcon },
    ],
  },
  {
    label: "Obrada",
    items: [
      { title: "GDPR zahtjevi", url: "/admin/data-requests", icon: ClipboardListIcon, pendingRequests: true },
      { title: "Šifrarnici", url: "/admin/codebooks", icon: Settings2Icon },
    ],
  },
  {
    label: "Sustav",
    items: [{ title: "Audit zapisi", url: "/admin/audit-logs", icon: ScrollTextIcon }],
  },
];

// Active item reads as a raised white tab on the grey sidebar
const itemClass = "h-9 font-medium hover:bg-sidebar-accent data-active:bg-card data-active:text-foreground data-active:shadow-[0_1px_2px_rgb(12_34_48/0.08)] data-active:ring-1 data-active:ring-sidebar-border data-active:[&_svg]:text-primary";

/** GDPR requests nobody has picked up yet. */
function PendingRequestsBadge() {
  const { data = [] } = useDataRequests("submitted");
  if (data.length === 0) return null;
  return <SidebarMenuBadge className="top-2! rounded-full bg-primary/10 px-1.5 font-semibold text-primary peer-hover/menu-button:text-primary peer-data-active/menu-button:text-primary">{data.length}</SidebarMenuBadge>;
}

function UserMenu({ user }: { user: { name: string; email: string } }) {
  const { isMobile } = useSidebar();
  const logout = useLogout();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-xs font-semibold text-white">{initials(user.name)}</span>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-foreground">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
              <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56" side={isMobile ? "bottom" : "right"} align="end" sideOffset={6}>
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><a href="/" target="_blank" rel="noreferrer"><ExternalLinkIcon />Javna stranica</a></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout.mutate()} disabled={logout.isPending}><LogOutIcon />Odjava</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AdminSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: { name: string; email: string } }) {
  const location = useLocation();
  const isActive = (url: string, exact?: boolean) => (exact ? location.pathname === url : location.pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent active:bg-transparent">
              <Link to="/admin">
                <span className="grid size-8 shrink-0 place-items-center"><BrandMark className="h-8" /></span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold text-foreground">Registar studenata</span>
                  <span className="truncate text-xs text-muted-foreground">Općina Tomislavgrad</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel className="text-[0.7rem] tracking-wide text-muted-foreground/80 uppercase">{group.label}</SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url, item.exact)} className={itemClass}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.pendingRequests && <PendingRequestsBadge />}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="pb-3">
        <UserMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
