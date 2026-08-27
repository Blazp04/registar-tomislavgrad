import { FileTextIcon } from "lucide-react";
import { useProfile } from "@/services/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const labels: Record<string, string> = { recorded: "Evidentirana", active: "Aktivna", completed: "Završena", suspended: "Obustavljena", rejected: "Odbijena" };

export default function StudentScholarshipsPage() {
  const { data, isPending } = useProfile();
  if (isPending) return <div className="grid min-h-[40vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  const items = data?.scholarships ?? [];
  return <div className="space-y-6"><div><h1 className="text-3xl font-semibold tracking-tight">Moje stipendije</h1><p className="mt-2 text-muted-foreground">Povijest stipendija po akademskim godinama. Zapise vodi administracija.</p></div>
    {items.length === 0 ? <Card><CardContent className="grid min-h-52 place-items-center text-center"><div><FileTextIcon className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-medium">Nema evidentiranih stipendija</p><p className="mt-1 text-sm text-muted-foreground">Kada administracija evidentira stipendiju, prikazat će se ovdje.</p></div></CardContent></Card> : <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <Card key={item.id}><CardContent className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{item.name ?? item.scholarshipTypeName ?? "Stipendija"}</p><p className="mt-1 text-sm text-muted-foreground">{item.providerName}</p></div><Badge variant={item.status === "active" ? "default" : "secondary"}>{labels[item.status]}</Badge></div><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-muted-foreground">Akademska godina</dt><dd className="mt-1 font-medium">{item.academicYear}</dd></div><div><dt className="text-muted-foreground">Razdoblje</dt><dd className="mt-1 font-medium">{item.startDate ? new Date(item.startDate).toLocaleDateString("hr-HR") : "-"}{item.endDate ? ` – ${new Date(item.endDate).toLocaleDateString("hr-HR")}` : ""}</dd></div>{item.amount && <div><dt className="text-muted-foreground">Iznos</dt><dd className="mt-1 font-medium">{Number(item.amount).toLocaleString("hr-HR", { style: "currency", currency: item.currency })}</dd></div>}</dl>{item.adminNote && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{item.adminNote}</p>}</CardContent></Card>)}</div>}
  </div>;
}
