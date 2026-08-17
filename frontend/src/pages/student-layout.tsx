import { FileTextIcon, GraduationCapIcon, LayoutDashboardIcon, LogOutIcon, MenuIcon, ShieldCheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useLogout, useSession } from "@/services/auth";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/app", label: "Pregled", icon: LayoutDashboardIcon, exact: true },
  { to: "/app/profile", label: "Moj profil", icon: GraduationCapIcon },
  { to: "/app/scholarships", label: "Stipendije", icon: FileTextIcon },
  { to: "/app/privacy", label: "Privatnost", icon: ShieldCheckIcon },
];

export default function StudentLayout() {
  const { data: session, isPending } = useSession();
  const logout = useLogout();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (isPending) return <div className="grid min-h-svh place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.role !== "student") return <Navigate to="/admin" replace />;

  return <div className="min-h-svh bg-slate-50">
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/app" className="flex items-center gap-3"><img src="/grb-tomislavgrad.png" alt="" className="h-10 w-auto" /><span className="text-sm font-semibold">Registar studenata</span></Link>
        <nav className="hidden items-center gap-1 md:flex">{links.map(({ to, label, icon: Icon, exact }) => <Button key={to} asChild variant={(exact ? location.pathname === to : location.pathname.startsWith(to)) ? "secondary" : "ghost"}><Link to={to}><Icon />{label}</Link></Button>)}</nav>
        <div className="hidden items-center gap-3 md:flex"><div className="text-right"><p className="text-sm font-medium">{session.user.firstName} {session.user.lastName}</p><p className="text-xs text-muted-foreground">{session.user.email}</p></div><Button variant="ghost" size="icon" aria-label="Odjava" onClick={() => logout.mutate()}><LogOutIcon /></Button></div>
        <Button className="md:hidden" variant="ghost" size="icon" onClick={() => setOpen((value) => !value)}>{open ? <XIcon /> : <MenuIcon />}</Button>
      </div>
      {open && <nav className="border-t bg-white p-4 md:hidden">{links.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm"><Icon className="h-4 w-4" />{label}</Link>)}<button onClick={() => logout.mutate()} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-destructive"><LogOutIcon className="h-4 w-4" />Odjava</button></nav>}
    </header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8"><Outlet /></main>
  </div>;
}
