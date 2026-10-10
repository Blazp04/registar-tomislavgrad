import { useProfile, type ScholarshipStatus } from "@/services/registry";
import { PageHeader, Spinner } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = { recorded: "Evidentirana", active: "Aktivna", completed: "Završena", suspended: "Obustavljena", rejected: "Odbijena" };
const variants: Record<ScholarshipStatus, "info" | "success" | "neutral" | "warning" | "destructive"> = { recorded: "neutral", active: "success", completed: "info", suspended: "warning", rejected: "destructive" };
const date = (value: string | null) => (value ? new Date(value).toLocaleDateString("hr-HR") : "—");

export default function StudentScholarshipsPage() {
  const { data, isPending } = useProfile();
  if (isPending) return <Spinner className="min-h-[40vh]" />;
  const items = data?.scholarships ?? [];
  return <div className="space-y-8">
    <PageHeader title="Moje stipendije" description="Povijest stipendija po akademskim godinama. Zapise vodi administracija Općine." />
    {items.length === 0 ? (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="font-medium">Nema evidentiranih stipendija</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Kada administracija evidentira stipendiju, prikazat će se ovdje.</p>
      </div>
    ) : (
      <ul className="space-y-4">{items.map((item) => (
        <li key={item.id} className="overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-display text-xl font-semibold tracking-tight">{item.name ?? item.scholarshipTypeName ?? "Stipendija"}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.providerName}</p>
            </div>
            <Badge variant={variants[item.status]}>{labels[item.status]}</Badge>
          </div>
          <dl className="grid grid-cols-2 border-t sm:grid-cols-3">
            <div className="px-6 py-4">
              <dt className="label-mono text-muted-foreground">Akademska godina</dt>
              <dd className="mt-1.5 font-medium tabular-nums">{item.academicYear}</dd>
            </div>
            <div className="border-l px-6 py-4">
              <dt className="label-mono text-muted-foreground">Razdoblje</dt>
              <dd className="mt-1.5 font-medium tabular-nums">{date(item.startDate)}{item.endDate ? ` – ${date(item.endDate)}` : ""}</dd>
            </div>
            <div className="col-span-2 border-t px-6 py-4 sm:col-span-1 sm:border-t-0 sm:border-l">
              <dt className="label-mono text-muted-foreground">Iznos</dt>
              <dd className="mt-1.5 font-medium tabular-nums">{item.amount ? Number(item.amount).toLocaleString("hr-HR", { style: "currency", currency: item.currency }) : "—"}</dd>
            </div>
          </dl>
          {item.adminNote && <p className="border-t bg-surface px-6 py-3.5 text-sm text-muted-foreground"><span className="font-medium text-foreground">Napomena: </span>{item.adminNote}</p>}
        </li>
      ))}</ul>
    )}
  </div>;
}
