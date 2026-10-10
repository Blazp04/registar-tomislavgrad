import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";
import { useSession } from "@/services/auth";
import { useStudentDashboard, type StudentDashboard } from "@/services/registry";
import { BrandMark, Stamp } from "@/components/brand";
import { Spinner } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const shortcuts = [
  { to: "/app/profile", title: "Ažuriraj podatke", text: "Osobni podaci, srednja škola i studiji" },
  { to: "/app/scholarships", title: "Pregledaj stipendije", text: "Povijest po akademskim godinama" },
  { to: "/app/privacy", title: "Privatnost i zahtjevi", text: "Privole, izvoz podataka i zahtjevi" },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Dobro jutro";
  if (hour < 18) return "Dobar dan";
  return "Dobra večer";
}

function RegistryCard({ data, fullName }: { data: StudentDashboard; fullName: string }) {
  const study = data.currentStudy;
  return (
    <div className="relative overflow-hidden rounded-xl border border-t-[3px] border-t-primary bg-card">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandMark className="h-8" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Općina Tomislavgrad</p>
            <p className="text-xs text-muted-foreground">Registar studenata i stipendija</p>
          </div>
        </div>
        <span className="label-mono hidden text-muted-foreground sm:block">Ak. god. {data.currentAcademicYear}</span>
      </div>

      <div className="relative isolate px-6 pt-7 pb-8">
        <div className="topo absolute inset-0 -z-10 text-navy/[0.06]" style={{ maskPosition: "85% 30%", WebkitMaskPosition: "85% 30%" }} aria-hidden="true" />
        <p className="label-mono text-muted-foreground">Ime i prezime</p>
        <p className="mt-2 font-display text-[2rem] leading-tight font-semibold tracking-[-0.03em]">{fullName}</p>
        <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
          {study ? [study.studyProgramName, study.facultyName].filter(Boolean).join(" · ") : "Studij još nije unesen"}
        </p>
        {!data.needsConfirmation && <Stamp className="absolute top-5 right-5 size-24 rotate-[-10deg] opacity-80" />}
      </div>

      <dl className="grid grid-cols-3 border-t">
        <div className="px-6 py-4">
          <dt className="label-mono text-muted-foreground">Godina</dt>
          <dd className="mt-1.5 font-medium">{study?.currentStudyYear ? `${study.currentStudyYear}.` : "—"}</dd>
        </div>
        <div className="border-l px-6 py-4">
          <dt className="label-mono text-muted-foreground">Potvrda</dt>
          <dd className="mt-1.5 font-medium">{data.needsConfirmation ? "Na čekanju" : data.verifiedAcademicYear}</dd>
        </div>
        <div className="border-l px-6 py-4">
          <dt className="label-mono text-muted-foreground">Profil</dt>
          <dd className="mt-1.5 font-medium tabular-nums">{data.completionPercentage}%</dd>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-navy" style={{ width: `${data.completionPercentage}%` }} /></div>
        </div>
      </dl>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { data, isPending, error } = useStudentDashboard();
  const { data: session } = useSession();
  if (isPending) return <Spinner />;
  if (error || !data) return <p className="rounded-md border-l-2 border-destructive bg-destructive/[0.05] p-4 text-sm text-destructive">Podatke nije moguće učitati.</p>;
  const incomplete = data.completionPercentage < 100;
  const fullName = session ? `${session.user.firstName} ${session.user.lastName}` : data.greetingName;
  const today = new Date().toLocaleDateString("hr-HR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return <div className="space-y-10">
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm text-muted-foreground first-letter:uppercase">{today}</p>
        <h1 className="mt-2 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl">{greeting()}, {data.greetingName}.</h1>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline"><Link to="/app/scholarships">Moje stipendije</Link></Button>
        <Button asChild><Link to="/app/profile">Uredi profil</Link></Button>
      </div>
    </header>

    {(incomplete || data.needsConfirmation) && (
      <div className="flex flex-col gap-4 rounded-lg border border-l-[3px] border-l-amber-500 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">{incomplete ? "Dovršite svoj profil" : `Potvrdite podatke za ${data.currentAcademicYear}`}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{incomplete ? "Nedostaju podaci potrebni za potpunu evidenciju." : "Pregledajte profil i potvrdite da su podaci još aktualni."}</p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0"><Link to="/app/profile">{incomplete ? "Dovrši profil" : "Pregledaj podatke"}<ArrowRightIcon /></Link></Button>
      </div>
    )}

    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <RegistryCard data={data} fullName={fullName} />

      <dl className="divide-y rounded-xl border bg-card text-sm">
        <div className="flex items-start justify-between gap-6 px-6 py-4">
          <dt className="text-muted-foreground">Trenutačni studij</dt>
          <dd className="text-right font-medium">{data.currentStudy?.studyProgramName ?? "Nije unesen"}</dd>
        </div>
        <div className="flex items-start justify-between gap-6 px-6 py-4">
          <dt className="text-muted-foreground">Mjesto studiranja</dt>
          <dd className="text-right font-medium">{data.currentStudy?.cityName ?? "—"}</dd>
        </div>
        <div className="flex items-center justify-between gap-6 px-6 py-4">
          <dt className="text-muted-foreground">Status podataka</dt>
          <dd><Badge variant={data.needsConfirmation ? "warning" : "success"}>{data.needsConfirmation ? "Potrebna potvrda" : `Potvrđeno ${data.verifiedAcademicYear}`}</Badge></dd>
        </div>
        <div className="flex items-start justify-between gap-6 px-6 py-4">
          <dt className="text-muted-foreground">Zadnje ažuriranje</dt>
          <dd className="font-medium tabular-nums">{new Date(data.lastUpdatedAt).toLocaleDateString("hr-HR")}</dd>
        </div>
        <div className="flex items-start justify-between gap-6 px-6 py-4">
          <dt className="text-muted-foreground">Stipendije</dt>
          <dd><Link to="/app/scholarships" className="font-medium text-primary hover:underline">{data.scholarships.length} {data.scholarships.length % 10 === 1 && data.scholarships.length % 100 !== 11 ? "zapis" : "zapisa"}</Link></dd>
        </div>
      </dl>
    </div>

    <section>
      <h2 className="font-sans text-sm font-medium tracking-normal text-muted-foreground">Prečaci</h2>
      <div className="mt-3 grid divide-y overflow-hidden rounded-xl border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {shortcuts.map(({ to, title, text }) => (
          <Link key={to} to={to} className="group flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-muted/50">
            <div className="min-w-0">
              <p className="font-medium">{title}</p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{text}</p>
            </div>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    </section>
  </div>;
}
