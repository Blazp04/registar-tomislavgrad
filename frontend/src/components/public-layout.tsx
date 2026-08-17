import { MenuIcon, ShieldCheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/#kako-radi", label: "Kako funkcionira" },
  { to: "/#tko-se-moze-registrirati", label: "Tko se može registrirati" },
  { to: "/#cesta-pitanja", label: "Česta pitanja" },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-svh bg-[#fbfaf8] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Registar – početna">
            <img src="/grb-tomislavgrad.png" alt="Grb Općine Tomislavgrad" className="h-11 w-auto" />
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight">Registar studenata</span>
              <span className="block text-xs text-slate-500">Općina Tomislavgrad</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Glavna navigacija">
            {links.map((link) => <a key={link.to} href={link.to} className="text-sm text-slate-600 transition hover:text-slate-950">{link.label}</a>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost"><Link to="/login">Prijavi se</Link></Button>
            <Button asChild><Link to="/register">Registriraj se</Link></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Otvori izbornik">
            {open ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>
        {open && (
          <div className="border-t bg-white px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {links.map((link) => <a key={link.to} href={link.to} onClick={() => setOpen(false)} className="py-1 text-sm text-slate-700">{link.label}</a>)}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline"><Link to="/login">Prijavi se</Link></Button>
                <Button asChild><Link to="/register">Registriraj se</Link></Button>
              </div>
            </nav>
          </div>
        )}
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 font-semibold"><ShieldCheckIcon className="h-5 w-5 text-primary" /> Registar studenata i stipendija</div>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">Pouzdana digitalna usluga za ažurnu evidenciju studenata s područja Općine Tomislavgrad i transparentan pregled stipendija.</p>
          </div>
          <div>
            <div className="text-sm font-semibold">Informacije</div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <Link to="/privacy">Politika privatnosti</Link><Link to="/terms">Uvjeti korištenja</Link><Link to="/contact">Kontakt</Link>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <div className="font-semibold text-slate-950">Općina Tomislavgrad</div>
            <p className="mt-3">Ulica Mijata Tomića 120<br />80240 Tomislavgrad</p>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} Općina Tomislavgrad. Sva prava pridržana.</div>
      </footer>
    </div>
  );
}
