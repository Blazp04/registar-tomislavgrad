import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/#kako-radi", label: "Kako funkcionira" },
  { to: "/#sto-trebate", label: "Što trebate" },
  { to: "/#cesta-pitanja", label: "Pitanja" },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-svh bg-[#fbfaf6] text-[#102d3d]">
      <header className="sticky top-0 z-40 border-b border-[#cdd0ca] bg-[#f1eee6]/94 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link to="/" className="flex items-center gap-3" aria-label="Registar studenata i stipendija - početna">
            <img src="/grb-tomislavgrad.png" alt="Općina Tomislavgrad" className="h-10 w-[146px] object-contain object-left sm:w-[170px]" />
            <span className="hidden h-8 w-px bg-[#bfc4c0] sm:block" aria-hidden="true" />
            <span className="hidden text-[0.67rem] font-semibold uppercase leading-[1.35] tracking-[0.13em] text-[#53666f] sm:block">
              Registar studenata<br />i stipendija
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Glavna navigacija">
            {links.map((link) => (
              <a key={link.to} href={link.to} className="border-b border-transparent py-1 text-sm font-medium text-[#53666f] transition-colors hover:border-[#b72e2a] hover:text-[#102d3d]">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" className="rounded-none px-4 text-[#102d3d] hover:bg-[#e4e0d6]"><Link to="/login">Prijava</Link></Button>
            <Button asChild className="rounded-none bg-[#b72e2a] px-5 text-white shadow-none hover:bg-[#982320]"><Link to="/register">Otvorite račun</Link></Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-none text-[#102d3d] md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Zatvori izbornik" : "Otvori izbornik"}
            aria-expanded={open}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>

        {open && (
          <div className="border-t border-[#cdd0ca] bg-[#f1eee6] px-5 py-5 md:hidden">
            <nav className="flex flex-col" aria-label="Mobilna navigacija">
              {links.map((link) => (
                <a key={link.to} href={link.to} onClick={() => setOpen(false)} className="border-b border-[#cdd0ca] py-3.5 text-sm font-medium">
                  {link.label}
                </a>
              ))}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="rounded-none border-[#102d3d] bg-transparent"><Link to="/login" onClick={() => setOpen(false)}>Prijava</Link></Button>
                <Button asChild className="rounded-none bg-[#b72e2a] hover:bg-[#982320]"><Link to="/register" onClick={() => setOpen(false)}>Otvorite račun</Link></Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="bg-[#102d3d] text-white">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.45fr_.75fr_.8fr] lg:px-12 xl:px-16">
          <div>
            <img src="/grb-tomislavgrad.png" alt="Općina Tomislavgrad" className="h-14 w-[240px] bg-white object-contain object-left px-3" />
            <p className="mt-6 max-w-md text-sm leading-7 text-white/58">Službena digitalna evidencija obrazovnog puta studenata s područja Općine Tomislavgrad.</p>
          </div>
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d9b55b]">Informacije</p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/72">
              <Link to="/privacy" className="hover:text-white">Politika privatnosti</Link>
              <Link to="/terms" className="hover:text-white">Uvjeti korištenja</Link>
              <Link to="/contact" className="hover:text-white">Kontakt</Link>
            </div>
          </div>
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d9b55b]">Općina Tomislavgrad</p>
            <p className="mt-5 text-sm leading-7 text-white/72">Ulica Mijata Tomića 120<br />80240 Tomislavgrad<br />Bosna i Hercegovina</p>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/38">© {new Date().getFullYear()} Općina Tomislavgrad. Sva prava pridržana.</div>
      </footer>
    </div>
  );
}
