import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-[1.9rem] leading-tight font-semibold sm:text-[2.25rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[0.95rem] leading-6 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Quiet icon holder: a bordered square; tone only tints the glyph. */
export function IconTile({ children, tone = "muted", className }: { children: ReactNode; tone?: "brand" | "navy" | "gold" | "success" | "warning" | "muted"; className?: string }) {
  const tones = {
    brand: "text-primary",
    navy: "text-navy dark:text-white",
    gold: "text-amber-700",
    success: "text-emerald-700",
    warning: "text-amber-700",
    muted: "text-muted-foreground",
  } as const;
  return <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg border bg-card [&_svg]:size-4", tones[tone], className)}>{children}</span>;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("grid min-h-[50vh] place-items-center", className)} role="status" aria-label="Učitavanje">
      <div className="size-7 animate-spin rounded-full border-2 border-foreground/10 border-t-primary" />
    </div>
  );
}
