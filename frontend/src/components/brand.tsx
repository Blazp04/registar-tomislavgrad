import { useId } from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return <img src="/grb-mark.png" alt="" aria-hidden="true" className={cn("h-9 w-auto shrink-0 select-none", className)} draggable={false} />;
}

export function BrandLogo({
  title = "Registar studenata",
  subtitle = "Općina Tomislavgrad",
  tone = "default",
  className,
}: {
  title?: string;
  subtitle?: string;
  tone?: "default" | "inverted";
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <span className="grid leading-tight">
        <span className={cn("text-[0.95rem] font-semibold tracking-tight", tone === "inverted" ? "text-white" : "text-foreground")}>{title}</span>
        <span className={cn("text-xs", tone === "inverted" ? "text-white/55" : "text-muted-foreground")}>{subtitle}</span>
      </span>
    </span>
  );
}

/** Round municipal stamp: circular lettering around the crest silhouette, in one ink colour. */
export function Stamp({ className, text = "OPĆINA TOMISLAVGRAD · REGISTAR STUDENATA · " }: { className?: string; text?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" className={cn("text-primary", className)} aria-hidden="true">
      <defs>
        <path id={`ring-${id}`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        <mask id={`crest-${id}`} style={{ maskType: "alpha" }}>
          <image href="/grb-mark.png" x="74" y="66" width="52" height="68" />
        </mask>
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="95" strokeWidth="3" />
        <circle cx="100" cy="100" r="88" strokeWidth="1" />
        <circle cx="100" cy="100" r="58" strokeWidth="1" />
      </g>
      <text fill="currentColor" fontSize="13.5" fontWeight="600" letterSpacing="2.2" style={{ fontFamily: "var(--font-mono)" }}>
        <textPath href={`#ring-${id}`}>{text}</textPath>
      </text>
      <rect x="70" y="62" width="60" height="76" fill="currentColor" mask={`url(#crest-${id})`} />
    </svg>
  );
}
