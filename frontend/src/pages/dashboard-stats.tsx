import { AlertTriangleIcon, CheckCircle2Icon, Clock3Icon, GraduationCapIcon, UsersIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminStats } from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Stat({ title, value, description, icon }: { title: string; value: number; description: string; icon: React.ReactNode }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle><span className="text-muted-foreground">{icon}</span></CardHeader><CardContent><p className="text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></CardContent></Card>;
}

function Distribution({ title, data }: { title: string; data: Array<{ name: string | number | null; count: number }> }) {
  const shown = data.slice(0, 10).map((item) => ({ ...item, label: String(item.name ?? "Nije uneseno") }));
  return <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="h-[300px]">{shown.length === 0 ? <div className="grid h-full place-items-center text-sm text-muted-foreground">Nema podataka</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={shown} layout="vertical" margin={{ left: 16, right: 16 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" name="Studenata" fill="#b63b31" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>}</CardContent></Card>;
}

export default function DashboardPage() {
  const { data, isPending, error } = useAdminStats();
  if (isPending) return <div className="grid min-h-[50vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (error || !data) return <p className="rounded-xl bg-destructive/10 p-4 text-destructive">Statistiku nije moguće učitati.</p>;
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">Administrativni pregled</h1><p className="mt-1 text-sm text-muted-foreground">Podaci koji pomažu u dnevnom radu i planiranju podrške studentima.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Stat title="Registrirani studenti" value={data.total} description="Svi studentski profili" icon={<UsersIcon className="h-4 w-4" />} /><Stat title="Aktivni studenti" value={data.active} description="Najmanje jedan aktivan studij" icon={<GraduationCapIcon className="h-4 w-4" />} /><Stat title="Završeni studenti" value={data.completed} description="Evidentiran završen studij" icon={<CheckCircle2Icon className="h-4 w-4" />} /><Stat title="Nepotvrđeni profili" value={data.unverified} description="Nisu potvrđeni ove godine" icon={<AlertTriangleIcon className="h-4 w-4" />} /><Stat title="Neažurirani profili" value={data.stale} description="Bez izmjene dulje od godine" icon={<Clock3Icon className="h-4 w-4" />} /></div>
    <div className="grid gap-4 lg:grid-cols-2"><Distribution title="Studenti po gradovima studiranja" data={data.byCity} /><Distribution title="Studenti po fakultetima" data={data.byFaculty} /><Distribution title="Studenti po studijskim programima" data={data.byProgram} /><Distribution title="Studenti po godinama studija" data={data.byStudyYear} /><Distribution title="Stipendisti po akademskoj godini" data={data.scholarshipByYear} /><Distribution title="Stipendije prema vrsti" data={data.scholarshipByType} /><Distribution title="Stipendije prema statusu" data={data.scholarshipByStatus} /></div>
  </div>;
}
