import { ArrowRightIcon, CalendarCheck2Icon, CheckCircle2Icon, CircleAlertIcon, FileTextIcon, GraduationCapIcon } from "lucide-react";
import { Link } from "react-router";
import { useStudentDashboard } from "@/services/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentDashboardPage() {
  const { data, isPending, error } = useStudentDashboard();
  if (isPending) return <div className="grid min-h-[50vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (error || !data) return <p className="rounded-xl bg-destructive/10 p-4 text-destructive">Podatke nije moguće učitati.</p>;
  const incomplete = data.completionPercentage < 100;
  return <div className="space-y-7">
    <div><p className="text-sm text-muted-foreground">Dobro došli natrag</p><h1 className="text-3xl font-semibold tracking-tight">Pozdrav, {data.greetingName}</h1><p className="mt-2 text-muted-foreground">Ovdje su najvažnije informacije i sljedeći koraci.</p></div>
    {(incomplete || data.needsConfirmation) && <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><CircleAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><p className="font-medium text-amber-950">{incomplete ? "Dovršite svoj profil" : `Potvrdite podatke za ${data.currentAcademicYear}`}</p><p className="mt-1 text-sm text-amber-800">{incomplete ? "Nedostaju podaci potrebni za potpunu evidenciju." : "Pregledajte profil i potvrdite da su podaci još aktualni."}</p></div></div><Button asChild><Link to="/app/profile">{incomplete ? "Dovrši profil" : "Pregledaj podatke"}<ArrowRightIcon /></Link></Button></div>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-sm text-muted-foreground">Dovršenost profila <CheckCircle2Icon className="h-4 w-4" /></CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{data.completionPercentage}%</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-primary" style={{ width: `${data.completionPercentage}%` }} /></div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-sm text-muted-foreground">Trenutačni studij <GraduationCapIcon className="h-4 w-4" /></CardTitle></CardHeader><CardContent><p className="line-clamp-2 font-semibold">{data.currentStudy?.studyProgramName ?? "Nije unesen"}</p><p className="mt-1 text-sm text-muted-foreground">{data.currentStudy?.currentStudyYear ? `${data.currentStudy.currentStudyYear}. godina` : "—"}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-sm text-muted-foreground">Status podataka <CalendarCheck2Icon className="h-4 w-4" /></CardTitle></CardHeader><CardContent><Badge variant={data.needsConfirmation ? "secondary" : "default"}>{data.needsConfirmation ? "Potrebna potvrda" : `Potvrđeno ${data.verifiedAcademicYear}`}</Badge><p className="mt-3 text-xs text-muted-foreground">Zadnje ažuriranje {new Date(data.lastUpdatedAt).toLocaleDateString("hr-HR")}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-sm text-muted-foreground">Stipendije <FileTextIcon className="h-4 w-4" /></CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{data.scholarships.length}</p><Button asChild variant="link" className="mt-1 h-auto p-0"><Link to="/app/scholarships">Pregledaj zapise</Link></Button></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Brze akcije</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Button asChild variant="outline" className="justify-between"><Link to="/app/profile">Ažuriraj podatke <ArrowRightIcon /></Link></Button><Button asChild variant="outline" className="justify-between"><Link to="/app/scholarships">Pregledaj stipendije <ArrowRightIcon /></Link></Button><Button asChild variant="outline" className="justify-between"><Link to="/app/privacy">Privatnost i zahtjevi <ArrowRightIcon /></Link></Button></CardContent></Card>
  </div>;
}
