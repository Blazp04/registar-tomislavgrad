import { ChevronDownIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useLogout, useSession } from "@/services/auth";
import { BrandLogo } from "@/components/brand";
import { Spinner } from "@/components/page-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, initials } from "@/lib/utils";

const links = [
  { to: "/app", label: "Pregled", exact: true },
  { to: "/app/profile", label: "Moj profil" },
  { to: "/app/scholarships", label: "Stipendije" },
  { to: "/app/privacy", label: "Privatnost" },
];

export default function StudentLayout() {
  const { data: session, isPending } = useSession();
  const logout = useLogout();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (isPending) return <Spinner className="min-h-svh" />;
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.role !== "student") return <Navigate to="/admin" replace />;

  const fullName = `${session.user.firstName} ${session.user.lastName}`;
  const isActive = (to: string, exact?: boolean) => (exact ? location.pathname === to : location.pathname.startsWith(to));

  return <div className="min-h-svh bg-background">
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-4 sm:px-6 lg:px-8">
        <Link to="/app" className="rounded-md"><BrandLogo /></Link>

        <nav className="hidden h-full items-stretch gap-7 md:flex" aria-label="Studentska navigacija">
          {links.map(({ to, label, exact }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to, exact) ? "page" : undefined}
              className={cn(
                "relative flex items-center text-sm font-medium transition-colors",
                isActive(to, exact) ? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-md py-1 pr-1.5 pl-1 transition-colors hover:bg-muted">
                <span className="grid size-8 place-items-center rounded-full bg-navy text-xs font-semibold text-white">{initials(fullName)}</span>
                <span className="max-w-36 truncate text-sm font-medium">{fullName}</span>
                <ChevronDownIcon className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="font-normal">
                <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/app/profile">Moj profil</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/app/privacy">Privatnost</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => logout.mutate()} disabled={logout.isPending}><LogOutIcon />Odjava</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button type="button" className="ml-auto grid size-9 place-items-center rounded-md border md:hidden" aria-label={open ? "Zatvori izbornik" : "Otvori izbornik"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
        </button>
      </div>

      {open && <nav className="border-t bg-card px-4 pb-5 md:hidden" aria-label="Mobilna navigacija">
        <div className="flex items-center gap-3 border-b py-4">
          <span className="grid size-9 place-items-center rounded-full bg-navy text-xs font-semibold text-white">{initials(fullName)}</span>
          <div className="min-w-0"><p className="truncate text-sm font-medium">{fullName}</p><p className="truncate text-xs text-muted-foreground">{session.user.email}</p></div>
        </div>
        {links.map(({ to, label, exact }) => (
          <Link key={to} to={to} onClick={() => setOpen(false)} className={cn("flex items-center justify-between border-b py-3.5 text-sm font-medium", isActive(to, exact) ? "text-primary" : "text-foreground")}>
            {label}{isActive(to, exact) && <span className="size-1.5 rounded-full bg-primary" />}
          </Link>
        ))}
        <button onClick={() => logout.mutate()} className="mt-2 flex w-full items-center gap-2 py-3 text-sm font-medium text-destructive"><LogOutIcon className="size-4" />Odjava</button>
      </nav>}
    </header>
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8"><Outlet /></main>
  </div>;
}
