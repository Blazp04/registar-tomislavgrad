import { useState, type CSSProperties } from "react";
import { AlertCircleIcon, ArrowRightIcon, TrendingUpIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router";
import { useAdminStats } from "@/services/admin";
import { useSession } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { currentAcademicYear } from "@/lib/utils";
import { Spinner } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Validated categorical palette, mirrored in the --chart-* tokens in index.css.
// Hex values (not CSS variables) because Recharts writes them into SVG attributes.
// Single-series charts use one hue; colour encodes identity, never rank.
const COLORS = {
  blue: "#1d6fb8",
  red: "#c8372d",
  gold: "#b58209",
  teal: "#0d9488",
  violet: "#7c4dbd",
  track: "#eef1f4",
  grid: "#e4e8ec",
  label: "#5f6b78",
  surface: "#ffffff",
};

const STATUS_LABELS = {
  recorded: "Evidentirana",
  active: "Aktivna",
  completed: "Završena",
  suspended: "Obustavljena",
  rejected: "Odbijena",
} as const;

const STATUS_ORDER = ["recorded", "rejected", "suspended", "active", "completed"] as const;

const STATUS_COLORS = {
  recorded: COLORS.blue,
  rejected: COLORS.red,
  suspended: COLORS.gold,
  active: COLORS.teal,
  completed: COLORS.violet,
} as const;

const numberFormatter = new Intl.NumberFormat("hr-HR");
const chartInitialDimension = { width: 320, height: 260 };
const tooltipStyle: CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  boxShadow: "0 12px 32px -8px rgb(16 45 61 / 0.18)",
  color: "var(--popover-foreground)",
  fontSize: 12,
  padding: "8px 12px",
};
const axisTick = { fontSize: 11, fill: COLORS.label };
const cursorFill = { fill: COLORS.track, opacity: 0.7 };

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function shorten(value: string, max = 24) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function integerTicks(max: number) {
  return max <= 5 ? Array.from({ length: max + 1 }, (_, index) => index) : undefined;
}

const studentsLink = (params: Record<string, string>) => `/admin/students?${new URLSearchParams(params)}`;

function staleCutoff() {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return cutoff.toISOString();
}

function KpiStat({ title, value, description, href, attention = false, className }: { title: string; value: number; description: string; href?: string; attention?: boolean; className?: string }) {
  const alert = attention && value > 0;
  return (
    <div className={`flex flex-col bg-card px-6 py-5 ${className ?? ""}`}>
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        {alert && <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />}
        {title}
      </dt>
      <dd className="mt-3 font-display text-[2.6rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">{numberFormatter.format(value)}</dd>
      <dd className="mt-2 text-xs leading-5 text-muted-foreground">{description}</dd>
      {href && value > 0 && (
        <dd className="mt-auto pt-3">
          <Link to={href} className="group inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Prikaži studente <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </dd>
      )}
    </div>
  );
}

function ConfirmationPanel({ total, unverified, stale, year }: { total: number; unverified: number; stale: number; year: string }) {
  const verified = Math.max(total - unverified, 0);
  const rate = percentage(verified, total);
  const rows = [
    { label: `Potvrđeni za ${year}`, value: verified, dot: "bg-[#1d6fb8]" },
    { label: "Čekaju potvrdu", value: unverified, dot: "bg-amber-400", href: studentsLink({ verification: "unverified" }) },
    { label: "Nisu ažurirani dulje od godinu dana", value: stale, dot: "bg-muted-foreground/40", href: studentsLink({ updatedBefore: staleCutoff() }) },
  ];
  return (
    <Card className="min-w-0 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Godišnja potvrda {year}</CardTitle>
        <CardDescription>Studenti jednom godišnje potvrđuju da su podaci u profilu točni.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-5xl leading-none font-semibold tracking-[-0.03em] tabular-nums">{rate}%</p>
            <p className="text-right text-sm text-muted-foreground">{verified} od {total} profila potvrđeno</p>
          </div>
          <div className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${rate}% profila potvrđeno`}>
            {verified > 0 && <div className="h-full rounded-full bg-[#1d6fb8]" style={{ width: `${rate}%` }} />}
            {unverified > 0 && <div className="h-full flex-1 rounded-full bg-amber-400" />}
          </div>
        </div>
        <ul className="divide-y border-y text-sm">
          {rows.map((row) => (
            <li key={row.label} className="flex min-h-12 items-center justify-between gap-4 py-2">
              <span className="flex items-center gap-2.5"><span className={`size-2 shrink-0 rounded-full ${row.dot}`} aria-hidden="true" />{row.label}</span>
              <span className="flex items-center gap-3">
                <span className="font-medium tabular-nums">{numberFormatter.format(row.value)}</span>
                {row.href && row.value > 0 && <Button asChild size="xs" variant="outline"><Link to={row.href}>Prikaži</Link></Button>}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-5 text-muted-foreground">Profil možete potvrditi i ručno, gumbom „Potvrdi {year}” na stranici studenta.</p>
      </CardContent>
    </Card>
  );
}

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div>
      <h2 id={id} className="text-2xl font-semibold">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function EmptyChart({ label = "Nema podataka za prikaz" }: { label?: string }) {
  return <div className="grid h-full min-h-52 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">{label}</div>;
}

function RankingChart({
  data,
}: {
  data: Array<{ name: string | number | null; count: number }>;
  total: number;
  singular: string;
}) {
  const shown = data.slice(0, 8).map((item) => {
    const fullName = String(item.name ?? "Nije uneseno");
    return { ...item, fullName, label: shorten(fullName) };
  });
  const maxCount = Math.max(...shown.map((item) => item.count), 1);

  if (shown.length === 0) return <EmptyChart />;

  return (
    <div className="space-y-3">
      <div style={{ height: Math.max(260, shown.length * 39) }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={chartInitialDimension}>
          <BarChart data={shown} layout="vertical" margin={{ left: 0, right: 34, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.grid} />
            <XAxis type="number" domain={[0, maxCount]} ticks={integerTicks(maxCount)} allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={150} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={cursorFill}
              contentStyle={tooltipStyle}
              formatter={(value) => [numberFormatter.format(Number(value)), "Studenata"]}
              labelFormatter={(label) => shown.find((item) => item.label === String(label))?.fullName ?? String(label)}
            />
            <Bar dataKey="count" name="Studenata" fill={COLORS.blue} radius={[0, 4, 4, 0]} maxBarSize={20}>
              <LabelList dataKey="count" position="right" fill={COLORS.label} fontSize={11} fontWeight={500} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default function DashboardPage() {
  const { data, isPending, error } = useAdminStats();
  const { data: session } = useSession();
  const [educationView, setEducationView] = useState<"city" | "faculty" | "program">("city");

  if (isPending) {
    return <Spinner />;
  }

  if (error || !data) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-center">
        <div className="space-y-2">
          <AlertCircleIcon className="mx-auto h-9 w-9 text-destructive" />
          <p className="font-medium">Statistiku nije moguće učitati.</p>
          <p className="text-sm text-muted-foreground">Pokušajte ponovno učitati stranicu.</p>
        </div>
      </div>
    );
  }

  const year = currentAcademicYear();
  const firstName = session?.user.firstName ?? "";
  const today = new Date().toLocaleDateString("hr-HR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Dobro jutro" : hour < 18 ? "Dobar dan" : "Dobra večer";

  const studyStatusData = [
    { label: "Aktivan studij", count: data.active },
    { label: "Završen studij", count: data.completed },
  ];
  const hasStudyStatusData = studyStatusData.some((item) => item.count > 0);
  const studyStatusMax = Math.max(...studyStatusData.map((item) => item.count), 1);

  const studyYearData = data.byStudyYear.map((item) => ({
    ...item,
    label: item.name === null ? "Nije uneseno" : `${item.name}. godina`,
  }));
  const studyYearMax = Math.max(...studyYearData.map((item) => item.count), 1);

  const scholarshipTrend = [...data.scholarshipByYear].reverse();
  const scholarshipTrendMax = Math.max(...scholarshipTrend.map((item) => item.count), 1);

  const scholarshipTypes = data.scholarshipByType.slice(0, 8).map((item) => ({
    ...item,
    fullName: item.name || "Bez vrste",
    label: shorten(item.name || "Bez vrste", 22),
  }));
  const scholarshipTypeMax = Math.max(...scholarshipTypes.map((item) => item.count), 1);
  const scholarshipStatuses = [...data.scholarshipByStatus]
    .sort((a, b) => STATUS_ORDER.indexOf(a.name) - STATUS_ORDER.indexOf(b.name))
    .map((item) => ({
      ...item,
      label: STATUS_LABELS[item.name],
      fill: STATUS_COLORS[item.name],
    }));
  const scholarshipTotal = scholarshipStatuses.reduce((sum, item) => sum + item.count, 0);
  const selectedEducationData = educationView === "city"
    ? data.byCity
    : educationView === "faculty"
      ? data.byFaculty
      : data.byProgram;
  const selectedEducationLabel = educationView === "city"
    ? "grad studiranja"
    : educationView === "faculty"
      ? "fakultet"
      : "studijski program";

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground first-letter:uppercase">{today} · akademska godina {year}</p>
            <h1 className="mt-1.5 text-[1.9rem] leading-tight font-semibold sm:text-[2.25rem]">{greeting}{firstName ? `, ${firstName}` : ""}.</h1>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-auto">
            <Link to="/admin/students">Pretraži studente <ArrowRightIcon /></Link>
          </Button>
        </div>
        <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 xl:grid-cols-5">
          <KpiStat className="sm:col-span-2 xl:col-span-1" title="Registrirani studenti" value={data.total} description="Svi studentski profili u registru" />
          <KpiStat title="Aktivni studenti" value={data.active} description={`${percentage(data.active, data.total)}% profila ima aktivan studij`} />
          <KpiStat title="Završeni studenti" value={data.completed} description={`${percentage(data.completed, data.total)}% profila ima završen studij`} />
          <KpiStat title="Čekaju potvrdu" value={data.unverified} description={data.unverified > 0 ? `Nisu potvrdili podatke za ${year}` : "Svi profili su potvrđeni"} href={studentsLink({ verification: "unverified" })} attention />
          <KpiStat title="Nisu nedavno ažurirani" value={data.stale} description={data.stale > 0 ? "Bez promjena dulje od godinu dana" : "Svi profili su nedavno ažurirani"} href={studentsLink({ updatedBefore: staleCutoff() })} attention />
        </dl>
      </div>

      <section className="space-y-4" aria-labelledby="overview-heading">
        <SectionHeading id="overview-heading" title="Status i kvaliteta registra" description="Najvažnije informacije za dnevni administrativni rad." />
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="min-w-0 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Evidentirani status studija</CardTitle>
              <CardDescription>Broj profila s najmanje jednim aktivnim odnosno završenim studijem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-[270px]">
                {!hasStudyStatusData ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={chartInitialDimension}>
                    <BarChart data={studyStatusData} margin={{ top: 24, right: 18, bottom: 4, left: 0 }} barCategoryGap="42%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                      <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, studyStatusMax]} ticks={integerTicks(studyStatusMax)} allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={cursorFill} formatter={(value) => [numberFormatter.format(Number(value)), "Studenata"]} />
                      <Bar dataKey="count" fill={COLORS.blue} radius={[4, 4, 0, 0]} maxBarSize={64}>
                        <LabelList dataKey="count" position="top" fill={COLORS.label} fontSize={12} fontWeight={600} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </CardContent>
          </Card>

          <ConfirmationPanel total={data.total} unverified={data.unverified} stale={data.stale} year={year} />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="education-heading">
        <SectionHeading id="education-heading" title="Gdje i što studenti studiraju" description="Raspodjela pomaže prepoznati najzastupljenija mjesta, ustanove i programe." />
        <div className="grid gap-4 xl:grid-cols-5">
          <Card className="min-w-0 xl:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Obrazovna raspodjela</CardTitle>
              <CardDescription>Prikazano je najviše osam kategorija s najvećim brojem studenata.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={educationView} onValueChange={(value) => setEducationView(value as typeof educationView)}>
                <TabsList className="mb-2 h-auto w-full sm:w-fit">
                  <TabsTrigger value="city">Gradovi</TabsTrigger>
                  <TabsTrigger value="faculty">Fakulteti</TabsTrigger>
                  <TabsTrigger value="program">Studijski programi</TabsTrigger>
                </TabsList>
                <TabsContent value={educationView}>
                  <RankingChart data={selectedEducationData} total={data.total} singular={selectedEducationLabel} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="min-w-0 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Studenti po godini studija</CardTitle>
              <CardDescription>Raspodjela trenutačno evidentiranih godina studija.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-[320px]">
                {studyYearData.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={chartInitialDimension}>
                    <BarChart data={studyYearData} margin={{ top: 24, right: 10, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                      <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, studyYearMax]} ticks={integerTicks(studyYearMax)} allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={cursorFill} formatter={(value) => [numberFormatter.format(Number(value)), "Studenata"]} />
                      <Bar dataKey="count" fill={COLORS.blue} radius={[4, 4, 0, 0]} maxBarSize={44}>
                        <LabelList dataKey="count" position="top" fill={COLORS.label} fontSize={11} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="scholarship-heading">
        <SectionHeading id="scholarship-heading" title="Stipendije kroz vrijeme" description="Kretanje broja stipendista te struktura stipendija prema vrsti i statusu." />
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUpIcon className="size-4 text-primary" /> Stipendisti po akademskoj godini</CardTitle>
              <CardDescription>Broj jedinstvenih studenata sa stipendijom u svakoj akademskoj godini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-[300px]">
                {scholarshipTrend.length === 0 ? <EmptyChart label="Još nema evidentiranih stipendija" /> : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={chartInitialDimension}>
                    <LineChart data={scholarshipTrend} margin={{ top: 28, right: 24, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                      <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, scholarshipTrendMax]} ticks={integerTicks(scholarshipTrendMax)} allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => [numberFormatter.format(Number(value)), "Stipendista"]} />
                      <Line type="monotone" dataKey="count" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 4, fill: COLORS.blue, strokeWidth: 2, stroke: COLORS.surface }} activeDot={{ r: 6, stroke: COLORS.surface, strokeWidth: 2 }}>
                        <LabelList dataKey="count" position="top" fill={COLORS.label} fontSize={11} fontWeight={600} />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-base">Status stipendija</CardTitle>
              <CardDescription>Trenutačna struktura svih evidentiranih stipendijskih zapisa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scholarshipStatuses.length === 0 ? <EmptyChart label="Još nema evidentiranih stipendija" /> : (
                <div className="grid min-h-[300px] grid-cols-[minmax(170px,1fr)_minmax(150px,1fr)] items-center gap-3">
                  <div className="relative h-[250px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={chartInitialDimension}>
                      <PieChart>
                        <Pie data={scholarshipStatuses} dataKey="count" nameKey="label" innerRadius="60%" outerRadius="84%" paddingAngle={2} stroke={COLORS.surface} strokeWidth={2} cornerRadius={4}>
                          {scholarshipStatuses.map((item) => <Cell key={item.name} fill={item.fill} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [numberFormatter.format(Number(value)), "Zapisa"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                      <p className="text-3xl font-semibold tracking-tight tabular-nums">{scholarshipTotal}</p>
                      <p className="text-xs text-muted-foreground">ukupno zapisa</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {scholarshipStatuses.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className="font-semibold tabular-nums">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="min-w-0 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Stipendije prema vrsti</CardTitle>
              <CardDescription>Koje su vrste stipendija najčešće zastupljene u registru.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div style={{ height: Math.max(250, scholarshipTypes.length * 40) }}>
                {scholarshipTypes.length === 0 ? <EmptyChart label="Još nema evidentiranih stipendija" /> : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={chartInitialDimension}>
                    <BarChart data={scholarshipTypes} layout="vertical" margin={{ left: 0, right: 36, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.grid} />
                      <XAxis type="number" domain={[0, scholarshipTypeMax]} ticks={integerTicks(scholarshipTypeMax)} allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="label" width={175} tick={axisTick} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={cursorFill}
                        formatter={(value) => [numberFormatter.format(Number(value)), "Stipendija"]}
                        labelFormatter={(label) => scholarshipTypes.find((item) => item.label === String(label))?.fullName ?? String(label)}
                      />
                      <Bar dataKey="count" fill={COLORS.blue} radius={[0, 4, 4, 0]} maxBarSize={20}>
                        <LabelList dataKey="count" position="right" fill={COLORS.label} fontSize={11} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
