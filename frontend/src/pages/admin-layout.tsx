import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "@/services/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const breadcrumbMap: Record<string, string> = { "/admin": "Dashboard", "/admin/students": "Studenti", "/admin/codebooks": "Šifrarnici", "/admin/data-requests": "GDPR zahtjevi", "/admin/audit-logs": "Audit zapisi" };

export default function AdminLayout() {
  const { data: session, isPending } = useSession();
  const location = useLocation();
  if (isPending) return <div className="grid min-h-svh place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.role !== "admin") return <Navigate to="/app" replace />;
  const title = breadcrumbMap[location.pathname] ?? (location.pathname.startsWith("/admin/students/") ? "Detalji studenta" : "Administracija");
  return <SidebarProvider><AppSidebar user={{ name: `${session.user.firstName} ${session.user.lastName}`, email: session.user.email }} /><SidebarInset><header className="flex h-16 shrink-0 items-center gap-2 border-b"><div className="flex items-center gap-2 px-4"><SidebarTrigger className="-ml-1" /><Separator orientation="vertical" className="mr-2 h-4" /><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>{title}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></div></header><div className="flex flex-1 flex-col gap-4 p-4 md:p-6"><Outlet /></div></SidebarInset></SidebarProvider>;
}
