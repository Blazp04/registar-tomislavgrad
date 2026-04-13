import { useStudentStats } from "@/services/students"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UsersIcon, GraduationCapIcon, BriefcaseIcon, TrendingUpIcon, AlertCircleIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts"

const BRAND_RED = "#c0392b"
const COLOR_GREEN = "#16a34a"
const COLOR_BLUE = "#2563eb"
const COLOR_MUTED = "#cbd5e1"

// Palette for many-item charts
const PALETTE = [
  "#c0392b", "#2563eb", "#16a34a", "#d97706", "#8b5cf6",
  "#0891b2", "#db2777", "#65a30d", "#ea580c", "#0ea5e9",
]

function StatCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string
  value: number
  sub?: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

const CustomRadialTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { data: stats, isPending, error } = useStudentStats()

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="h-10 w-10 text-destructive" />
          <p className="text-lg font-medium">Greška pri učitavanju podataka</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return <p className="text-muted-foreground">Nema podataka za prikaz.</p>
  }

  const total = stats.total ?? 0
  const currentStudents = stats.currentStudents ?? 0
  const formerStudents = stats.formerStudents ?? 0
  const employed = stats.employed ?? 0
  const unemployed = stats.unemployed ?? 0
  const workingInField = stats.workingInField ?? 0
  const notWorkingInField = stats.notWorkingInField ?? 0

  const enrolledRate = total > 0 ? Math.round((currentStudents / total) * 100) : 0
  const employmentRate = total > 0 ? Math.round((employed / total) * 100) : 0
  const fieldRate = employed > 0 ? Math.round((workingInField / employed) * 100) : 0

  // Grouped overview bar chart — 3 groups, 2 bars each
  const overviewData = [
    { category: "Status", aktivan: currentStudents, neaktivan: formerStudents },
    { category: "Zaposlenost", aktivan: employed, neaktivan: unemployed },
    { category: "Rad u struci", aktivan: workingInField, neaktivan: notWorkingInField },
  ]

  // RadialBar — 3 rings showing % rates
  const ratesData = [
    { name: "Rad u struci", value: fieldRate, fill: COLOR_BLUE },
    { name: "Stopa zaposlenosti", value: employmentRate, fill: COLOR_GREEN },
    { name: "Stopa studiranja", value: enrolledRate, fill: BRAND_RED },
  ]

  const facultyData = (stats.byFaculty ?? [])
    .slice(0, 12)
    .map((f) => ({
      name: (f.facultyName ?? "").length > 28 ? (f.facultyName ?? "").slice(0, 28) + "…" : (f.facultyName ?? ""),
      fullName: f.facultyName ?? "",
      count: f.count ?? 0,
    }))

  const fieldData = (stats.byFieldOfStudy ?? [])
    .slice(0, 12)
    .map((f) => ({
      name: (f.fieldOfStudyName ?? "").length > 28 ? (f.fieldOfStudyName ?? "").slice(0, 28) + "…" : (f.fieldOfStudyName ?? ""),
      fullName: f.fieldOfStudyName ?? "",
      count: f.count ?? 0,
    }))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ukupno registriranih"
          value={total}
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Trenutni studenti"
          value={currentStudents}
          sub={`Bivši: ${formerStudents}`}
          icon={<GraduationCapIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Zaposleni"
          value={employed}
          sub={`Nezaposleni: ${unemployed}`}
          icon={<BriefcaseIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Rade u struci"
          value={workingInField}
          sub={`od zaposlenih: ${employed}`}
          icon={<TrendingUpIcon className="h-4 w-4" />}
        />
      </div>

      {/* Overview charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Grouped bar — 3 cols */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Pregled po kategorijama</CardTitle>
            <CardDescription>Usporedba aktivnih i neaktivnih vrijednosti po kategoriji</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData} barGap={4} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                <Bar dataKey="aktivan" name="Aktivni" fill={BRAND_RED} radius={[4, 4, 0, 0]} />
                <Bar dataKey="neaktivan" name="Neaktivni" fill={COLOR_MUTED} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* RadialBar rates — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Postotne stope</CardTitle>
            <CardDescription>Udio studiranja, zaposlenosti i rada u struci</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="25%"
                outerRadius="85%"
                data={ratesData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  background={{ fill: "#f1f5f9" }}
                  cornerRadius={6}
                  label={false}
                />
                <Tooltip content={<CustomRadialTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                  formatter={(value: string, entry: any) => (
                    <span style={{ color: entry.payload.fill }}>
                      {value} ({entry.payload.value}%)
                    </span>
                  )}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribution charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Faculty distribution */}
        {facultyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribucija po fakultetima</CardTitle>
              <CardDescription>Top {facultyData.length} fakulteta po broju studenata</CardDescription>
            </CardHeader>
            <CardContent style={{ height: Math.max(220, facultyData.length * 36) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facultyData} layout="vertical" margin={{ left: 0, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    formatter={(v: any) => [v, "Studenata"]}
                    labelFormatter={(label: any) => facultyData.find((f) => f.name === label)?.fullName ?? label}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {facultyData.map((_entry, index) => (
                      <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Field of study distribution */}
        {fieldData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribucija po smjerovima</CardTitle>
              <CardDescription>Top {fieldData.length} smjerova po broju studenata</CardDescription>
            </CardHeader>
            <CardContent style={{ height: Math.max(220, fieldData.length * 36) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fieldData} layout="vertical" margin={{ left: 0, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    formatter={(v: any) => [v, "Studenata"]}
                    labelFormatter={(label: any) => fieldData.find((f) => f.name === label)?.fullName ?? label}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {fieldData.map((_entry, index) => (
                      <Cell key={index} fill={PALETTE[(index + 3) % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
