import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  description,
  icon,
  children,
  footer,
  wide = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-[1fr_0.9fr]">
      <div className="flex items-center justify-center bg-card px-5 py-14 sm:px-8 lg:py-20">
        <div className={cn("w-full", wide ? "max-w-lg" : "max-w-sm")}>
          {icon && <div className="mb-7">{icon}</div>}
          <h1 className="text-[2rem] leading-tight font-semibold sm:text-[2.5rem]">{title}</h1>
          {description && <p className="mt-3 text-[0.95rem] leading-6 text-muted-foreground">{description}</p>}
          {children && <div className="mt-9">{children}</div>}
          {footer && <div className="mt-9 border-t pt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>

      <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-navy-deep p-12 text-white lg:flex">
        <img src="/teren-hero.svg" alt="" aria-hidden="true" className="topo-drift absolute inset-0 -z-10 size-full object-cover" />
        <p className="label-mono flex justify-between text-white/40"><span>Općina Tomislavgrad</span><span>43°43′ N · 17°14′ E</span></p>
        <div>
          <BrandMark className="h-14" />
          <p className="mt-8 max-w-md font-display text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.035em]">Vaše studiranje, <span className="text-brand-bright">na jednom mjestu.</span></p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">Službena digitalna evidencija obrazovnog puta studenata s područja Općine Tomislavgrad.</p>
        </div>
      </aside>
    </section>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return <div role="alert" className="rounded-md border-l-2 border-destructive bg-destructive/[0.05] px-4 py-3 text-sm text-destructive">{children}</div>;
}

export function StatusIcon({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "success" }) {
  return <span className={cn("grid size-11 place-items-center rounded-lg border bg-card [&_svg]:size-5", tone === "success" ? "text-emerald-700" : "text-primary")}>{children}</span>;
}
