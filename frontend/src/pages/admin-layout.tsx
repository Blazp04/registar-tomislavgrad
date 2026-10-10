import { ArrowUpRightIcon } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "@/services/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Spinner } from "@/components/page-header";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { currentAcademicYear } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = { "/admin": "Pregled", "/admin/students": "Studenti", "/admin/codebooks": "Šifrarnici", "/admin/data-requests": "GDPR zahtjevi", "/admin/audit-logs": "Audit zapisi" };

export default function AdminLayout() {
  const { data: session, isPending } = useSession();
  const location = useLocation();
  if (isPending) return <Spinner className="min-h-svh" />;
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.role !== "admin") return <Navigate to="/app" replace />;
  const title = breadcrumbMap[location.pathname] ?? (location.pathname.startsWith("/admin/students/") ? "Detalji studenta" : "Administracija");

  return <SidebarProvider>
    <AdminSidebar variant="inset" user={{ name: `${session.user.firstName} ${session.user.lastName}`, email: session.user.email }} />
    <SidebarInset className="md:peer-data-[variant=inset]:shadow-[0_1px_3px_rgb(12_34_48/0.06)] md:peer-data-[variant=inset]:ring-1 md:peer-data-[variant=inset]:ring-sidebar-border">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-md md:rounded-t-xl md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1 text-muted-foreground" />
          <Separator orientation="vertical" className="mr-2 h-4 data-vertical:self-center" />
          <Breadcrumb><BreadcrumbList>
            <BreadcrumbItem className="hidden sm:inline-flex">Administracija</BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem><BreadcrumbPage className="font-medium">{title}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList></Breadcrumb>
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <span className="label-mono hidden text-muted-foreground md:inline">Ak. god. {currentAcademicYear()}</span>
          <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
            Javna stranica <ArrowUpRightIcon className="size-3.5" />
          </a>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-8 md:px-8 md:py-10"><Outlet /></div>
    </SidebarInset>
  </SidebarProvider>;
}
