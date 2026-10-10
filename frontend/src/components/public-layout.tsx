import { ArrowUpRightIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router";
import { BrandLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/#kako-radi", label: "Kako funkcionira" },
  { to: "/#sto-trebate", label: "Što trebate" },
  { to: "/#cesta-pitanja", label: "Pitanja" },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-deep/95 text-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/" aria-label="Registar studenata i stipendija - početna" className="rounded-md">
            <BrandLogo title="Registar studenata i stipendija" tone="inverted" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Glavna navigacija">
            {links.map((link) => (
              <a key={link.to} href={link.to} className="text-sm text-white/65 transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <Link to="/login" className="text-sm font-medium text-white/80 transition-colors hover:text-white">Prijava</Link>
            <Button asChild><Link to="/register">Otvorite račun</Link></Button>
          </div>

          <button
            type="button"
            className="grid size-9 place-items-center rounded-md border border-white/15 text-white md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Zatvori izbornik" : "Otvori izbornik"}
            aria-expanded={open}
          >
            {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-white/10 px-5 pb-6 pt-2 md:hidden" aria-label="Mobilna navigacija">
            {links.map((link) => (
              <a key={link.to} href={link.to} onClick={() => setOpen(false)} className="block border-b border-white/10 py-3.5 text-sm text-white/80">
                {link.label}
              </a>
            ))}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="lg" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/login" onClick={() => setOpen(false)}>Prijava</Link></Button>
              <Button asChild size="lg"><Link to="/register" onClick={() => setOpen(false)}>Otvorite račun</Link></Button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-navy-deep text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 pb-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <BrandLogo title="Registar studenata i stipendija" tone="inverted" />
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">Službena digitalna evidencija obrazovnog puta studenata s područja Općine Tomislavgrad.</p>
          </div>
          <div>
            <p className="label-mono text-white/40">Informacije</p>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              <li><Link to="/privacy" className="hover:text-white">Politika privatnosti</Link></li>
              <li><Link to="/terms" className="hover:text-white">Uvjeti korištenja</Link></li>
              <li><Link to="/contact" className="hover:text-white">Kontakt</Link></li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-white/40">Općina Tomislavgrad</p>
            <address className="mt-5 space-y-3 text-sm not-italic leading-6 text-white/75">
              <p>Ulica Mijata Tomića 120<br />80240 Tomislavgrad</p>
              <p><a href="tel:+38734356400" className="hover:text-white">+387 34 356-400</a><br /><a href="mailto:opcina.tg@tel.net.ba" className="inline-flex items-center gap-1 hover:text-white">opcina.tg@tel.net.ba <ArrowUpRightIcon className="size-3.5" /></a></p>
            </address>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Općina Tomislavgrad</span>
            <span className="font-mono">43°43′ N · 17°14′ E</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
