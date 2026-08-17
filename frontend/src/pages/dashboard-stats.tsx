import { useState, type CSSProperties, type ReactNode } from "react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  Clock3Icon,
  GraduationCapIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
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
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminStats } from "@/services/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = {
  red: "#b63b31",
  blue: "#2563eb",
  green: "#16a34a",
  amber: "#d97706",
  purple: "#7c3aed",
  cyan: "#0891b2",
  pink: "#db2777",
  lime: "#65a30d",
  muted: "#cbd5e1",
};

const PALETTE = [
  COLORS.red,
  COLORS.blue,
  COLORS.green,
  COLORS.amber,
  COLORS.purple,
  COLORS.cyan,
  COLORS.pink,
  COLORS.lime,
];

const STATUS_LABELS = {
  recorded: "Evidentirana",
  active: "Aktivna",
  completed: "Završena",
  suspended: "Obustavljena",
  rejected: "Odbijena",
} as const;

const STATUS_COLORS = {
  recorded: COLORS.blue,
  active: COLORS.green,
  completed: COLORS.purple,
  suspended: COLORS.amber,
  rejected: COLORS.red,
} as const;

const numberFormatter = new Intl.NumberFormat("hr-HR");
const chartInitialDimension = { width: 320, height: 260 };
const tooltipStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  fontSize: 12,
};

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function shorten(value: string, max = 24) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function integerTicks(max: number) {
  return max <= 5 ? Array.from({ length: max + 1 }, (_, index) => index) : undefined;
}

function StatCard({
  title,
  value,
  description,
  icon,
  attention = false,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  attention?: boolean;
}) {
  return (
    <Card className={attention && value > 0 ? "border-amber-200 bg-amber-50/40" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={attention && value > 0 ? "text-amber-700" : "text-muted-foreground"}>{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{numberFormatter.format(value)}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function Insight({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
      <span className="font-semibold text-foreground">Što podatak govori: </span>
      {children}
    </div>
  );
}

function EmptyChart({ label = "Nema podataka za prikaz" }: { label?: string }) {
  return <div className="grid h-full min-h-52 place-items-center text-sm text-muted-foreground">{label}</div>;
}

function RankingChart({
  data,
  total,
  singular,
  paletteOffset = 0,
}: {
  data: Array<{ name: string | number | null; count: number }>;
  total: number;
  singular: string;
  paletteOffset?: number;
}) {
  const shown = data.slice(0, 8).map((item) => {
    const fullName = String(item.name ?? "Nije uneseno");
    return { ...item, fullName, label: shorten(fullName) };
  });
  const leader = shown[0];
  const maxCount = Math.max(...shown.map((item) => item.count), 1);

  if (shown.length === 0) return <EmptyChart />;

  return (
    <div className="space-y-3">
      <div style={{ height: Math.max(260, shown.length * 39) }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={chartInitialDimension}>
          <BarChart data={shown} layout="vertical" margin={{ left: 0, right: 34, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, maxCount]} ticks={integerTicks(maxCount)} allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
              contentStyle={tooltipStyle}
              formatter={(value) => [numberFormatter.format(Number(value)), "Studenata"]}
              labelFormatter={(label) => shown.find((item) => item.label === String(label))?.fullName ?? String(label)}
            />
            <Bar dataKey="count" name="Studenata" radius={[0, 5, 5, 0]} maxBarSize={22}>
              {shown.map((item, index) => (
                <Cell key={item.fullName} fill={PALETTE[(index + paletteOffset) % PALETTE.length]} />
              ))}
              <LabelList dataKey="count" position="right" fill="#475569" fontSize={11} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Insight>
        Najzastupljeniji {singular} je <strong className="text-foreground">{leader.fullName}</strong>. Broj studenata: {numberFormatter.format(leader.count)}
        {total > 0 ? ` (${percentage(leader.count, total)}% svih profila)` : ""}.
      </Insight>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isPending, error } = useAdminStats();
  const [educationView, setEducationView] = useState<"city" | "faculty" | "program">("city");

  if (isPending) {
    return <div className="grid min-h-[50vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
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

  const verified = Math.max(data.total - data.unverified, 0);
  const recentlyUpdated = Math.max(data.total - data.stale, 0);
  const verifiedRate = percentage(verified, data.total);
  const recentRate = percentage(recentlyUpdated, data.total);

  const studyStatusData = [
    { label: "Aktivan studij", count: data.active, fill: COLORS.green },
    { label: "Završen studij", count: data.completed, fill: COLORS.blue },
  ];
  const hasStudyStatusData = studyStatusData.some((item) => item.count > 0);
  const studyStatusMax = Math.max(...studyStatusData.map((item) => item.count), 1);

  const qualityData = [
    { name: "Potvrđeni ove godine", value: verifiedRate, count: verified, fill: COLORS.green },
    { name: "Ažurirani u zadnjih godinu dana", value: recentRate, count: recentlyUpdated, fill: COLORS.blue },
  ];

  const studyYearData = data.byStudyYear.map((item) => ({
    ...item,
    label: item.name === null ? "Nije uneseno" : `${item.name}. godina`,
  }));
  const leadingStudyYear = [...studyYearData].sort((a, b) => b.count - a.count)[0];
  const studyYearMax = Math.max(...studyYearData.map((item) => item.count), 1);

  const scholarshipTrend = [...data.scholarshipByYear].reverse();
  const latestScholarshipYear = data.scholarshipByYear[0];
  const previousScholarshipYear = data.scholarshipByYear[1];
  const scholarshipDelta = latestScholarshipYear && previousScholarshipYear
    ? latestScholarshipYear.count - previousScholarshipYear.count
    : null;
  const scholarshipTrendMax = Math.max(...scholarshipTrend.map((item) => item.count), 1);

  const scholarshipTypes = data.scholarshipByType.slice(0, 8).map((item) => ({
    ...item,
    fullName: item.name || "Bez vrste",
    label: shorten(item.name || "Bez vrste", 22),
  }));
  const scholarshipTypeMax = Math.max(...scholarshipTypes.map((item) => item.count), 1);
  const scholarshipStatuses = data.scholarshipByStatus.map((item) => ({
    ...item,
    label: STATUS_LABELS[item.name],
    fill: STATUS_COLORS[item.name],
  }));
  const scholarshipTotal = scholarshipStatuses.reduce((sum, item) => sum + item.count, 0);
  const activeScholarships = scholarshipStatuses.find((item) => item.name === "active")?.count ?? 0;
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
  const selectedEducationPalette = educationView === "city" ? 0 : educationView === "faculty" ? 2 : 4;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pregled registra</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Što podaci govore danas</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
          Brzi pregled studentskog statusa, kvalitete podataka i raspodjele stipendija za donošenje svakodnevnih odluka.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Registrirani studenti" value={data.total} description="Svi studentski profili u registru" icon={<UsersIcon className="h-4 w-4" />} />
        <StatCard title="Aktivni studenti" value={data.active} description={`${percentage(data.active, data.total)}% svih profila ima aktivan studij`} icon={<GraduationCapIcon className="h-4 w-4" />} />
        <StatCard title="Završeni studenti" value={data.completed} description={`${percentage(data.completed, data.total)}% svih profila ima završen studij`} icon={<CheckCircle2Icon className="h-4 w-4" />} />
        <StatCard title="Čekaju potvrdu" value={data.unverified} description={data.unverified > 0 ? `${percentage(data.unverified, data.total)}% profila zahtijeva godišnju potvrdu` : "Svi profili su potvrđeni"} icon={<AlertTriangleIcon className="h-4 w-4" />} attention />
        <StatCard title="Nisu nedavno ažurirani" value={data.stale} description={data.stale > 0 ? `${percentage(data.stale, data.total)}% profila nije mijenjano dulje od godine` : "Svi profili su nedavno ažurirani"} icon={<Clock3Icon className="h-4 w-4" />} attention />
      </div>

      <section className="space-y-4" aria-labelledby="overview-heading">
        <div>
          <h2 id="overview-heading" className="text-lg font-semibold">Status i kvaliteta registra</h2>
          <p className="mt-1 text-sm text-muted-foreground">Najvažnije informacije za dnevni administrativni rad.</p>
        </div>
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, studyStatusMax]} ticks={integerTicks(studyStatusMax)} allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(15, 23, 42, 0.04)" }} formatter={(value) => [numberFormatter.format(Number(value)), "Studenata"]} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={72}>
                        {studyStatusData.map((item) => <Cell key={item.label} fill={item.fill} />)}
                        <LabelList dataKey="count" position="top" fill="#334155" fontSize={12} fontWeight={600} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <Insight>
                {data.active > 0
                  ? `${percentage(data.active, data.total)}% profila ima aktivan studij. Student može biti u obje kategorije ako ima više obrazovnih zapisa.`
                  : "Još nema evidentiranih aktivnih studija. Provjerite jesu li obrazovni podaci studenata uneseni."}
              </Insight>
            </CardContent>
          </Card>

          <Card className="min-w-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Pouzdanost podataka</CardTitle>
              <CardDescription>Koliki je dio registra potvrđen i nedavno ažuriran.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid min-h-[270px] grid-cols-[minmax(150px,1fr)_minmax(145px,1fr)] items-center gap-2">
                <ResponsiveContainer width="100%" height={220} minWidth={0} initialDimension={chartInitialDimension}>
                  <RadialBarChart data={qualityData} innerRadius="34%" outerRadius="94%" startAngle={90} endAngle={-270} barSize={16}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar dataKey="value" background={{ fill: "#e2e8f0" }} cornerRadius={8} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value)}%`, "Udio"]} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="space-y-5">
                  {qualityData.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span>{item.name}</span>
                      </div>
                      <p className="mt-1 pl-[18px] text-2xl font-semibold">{item.value}%</p>
                      <p className="pl-[18px] text-xs text-muted-foreground">{item.count} od {data.total}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Insight>
                {data.unverified === 0 && data.stale === 0
                  ? "Svi profili su potvrđeni i ažurirani unutar zadnjih godinu dana."
                  : `Prioritet je obraditi ${data.unverified} nepotvrđenih i ${data.stale} neažuriranih profila.`}
              </Insight>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="education-heading">
        <div>
          <h2 id="education-heading" className="text-lg font-semibold">Gdje i što studenti studiraju</h2>
          <p className="mt-1 text-sm text-muted-foreground">Raspodjela pomaže prepoznati najzastupljenija mjesta, ustanove i programe.</p>
        </div>
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
                  <RankingChart data={selectedEducationData} total={data.total} singular={selectedEducationLabel} paletteOffset={selectedEducationPalette} />
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, studyYearMax]} ticks={integerTicks(studyYearMax)} allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(15, 23, 42, 0.04)" }} formatter={(value) => [numberFormatter.format(Number(value)), "Studenata"]} />
                      <Bar dataKey="count" fill={COLORS.purple} radius={[5, 5, 0, 0]} maxBarSize={48}>
                        <LabelList dataKey="count" position="top" fill="#475569" fontSize={11} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {leadingStudyYear && (
                <Insight>
                  Najviše je studenata na <strong className="text-foreground">{leadingStudyYear.label.toLowerCase()}</strong>: {leadingStudyYear.count}
                  {data.total > 0 ? ` (${percentage(leadingStudyYear.count, data.total)}% svih profila)` : ""}.
                </Insight>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="scholarship-heading">
        <div>
          <h2 id="scholarship-heading" className="text-lg font-semibold">Stipendije kroz vrijeme</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kretanje broja stipendista te struktura stipendija prema vrsti i statusu.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUpIcon className="h-4 w-4 text-muted-foreground" /> Stipendisti po akademskoj godini</CardTitle>
              <CardDescription>Broj jedinstvenih studenata sa stipendijom u svakoj akademskoj godini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-[300px]">
                {scholarshipTrend.length === 0 ? <EmptyChart label="Još nema evidentiranih stipendija" /> : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={chartInitialDimension}>
                    <LineChart data={scholarshipTrend} margin={{ top: 28, right: 24, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, scholarshipTrendMax]} ticks={integerTicks(scholarshipTrendMax)} allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => [numberFormatter.format(Number(value)), "Stipendista"]} />
                      <Line type="monotone" dataKey="count" stroke={COLORS.red} strokeWidth={3} dot={{ r: 5, fill: COLORS.red, strokeWidth: 2, stroke: "white" }} activeDot={{ r: 7 }}>
                        <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={600} />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              {latestScholarshipYear && (
                <Insight>
                  Broj stipendista u {latestScholarshipYear.name}: {latestScholarshipYear.count}
                  {scholarshipDelta === null || scholarshipDelta === 0
                    ? "."
                    : `, ${Math.abs(scholarshipDelta)} ${scholarshipDelta > 0 ? "više" : "manje"} nego ${previousScholarshipYear.name}.`}
                </Insight>
              )}
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
                        <Pie data={scholarshipStatuses} dataKey="count" nameKey="label" innerRadius="56%" outerRadius="82%" paddingAngle={3}>
                          {scholarshipStatuses.map((item) => <Cell key={item.name} fill={item.fill} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [numberFormatter.format(Number(value)), "Zapisa"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                      <p className="text-3xl font-semibold">{scholarshipTotal}</p>
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
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {scholarshipStatuses.length > 0 && (
                <Insight>
                  Aktivnih je {activeScholarships} od {scholarshipTotal} stipendijskih zapisa ({percentage(activeScholarships, scholarshipTotal)}%).
                </Insight>
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
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, scholarshipTypeMax]} ticks={integerTicks(scholarshipTypeMax)} allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="label" width={175} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                        formatter={(value) => [numberFormatter.format(Number(value)), "Stipendija"]}
                        labelFormatter={(label) => scholarshipTypes.find((item) => item.label === String(label))?.fullName ?? String(label)}
                      />
                      <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={24}>
                        {scholarshipTypes.map((item, index) => <Cell key={item.fullName} fill={PALETTE[index % PALETTE.length]} />)}
                        <LabelList dataKey="count" position="right" fill="#475569" fontSize={11} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {scholarshipTypes[0] && (
                <Insight>
                  Najčešća je <strong className="text-foreground">{scholarshipTypes[0].fullName}</strong>. Broj evidentiranih stipendija: {scholarshipTypes[0].count}.
                </Insight>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
