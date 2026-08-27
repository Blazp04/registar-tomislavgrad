import { useMemo, useState } from "react"
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  FilterXIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { Link } from "react-router"

import {
  exportAdminStudents,
  useAdminStudents,
  type StudentFilters,
} from "@/services/admin"
import { useCodebooks, type CodebookType } from "@/services/codebooks"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const defaultFilters: StudentFilters = {
  page: "1",
  limit: "20",
  sort: "lastName",
  order: "asc",
}

const statusLabels: Record<string, string> = {
  active: "Aktivan",
  paused: "Mirovanje",
  completed: "Završen",
  withdrawn: "Prekinut",
}

const studyStatusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}))

const studyYearOptions = [1, 2, 3, 4, 5, 6].map((year) => ({
  value: String(year),
  label: `${year}. godina`,
}))

const scholarshipStatusOptions = [
  { value: "recorded", label: "Evidentirana" },
  { value: "active", label: "Aktivna" },
  { value: "completed", label: "Završena" },
  { value: "suspended", label: "Obustavljena" },
  { value: "rejected", label: "Odbijena" },
]

const verificationOptions = [
  { value: "verified", label: "Potvrđeni" },
  { value: "unverified", label: "Nepotvrđeni" },
]

const filterKeys: Array<keyof StudentFilters> = [
  "search",
  "academicYear",
  "cityId",
  "facultyId",
  "studyProgramId",
  "currentStudyYear",
  "studyStatus",
  "scholarshipTypeId",
  "scholarshipStatus",
  "updatedBefore",
  "updatedAfter",
  "verification",
]

const advancedFilterKeys: Array<keyof StudentFilters> = [
  "academicYear",
  "studyProgramId",
  "scholarshipTypeId",
  "scholarshipStatus",
  "updatedBefore",
  "updatedAfter",
  "verification",
]

interface CodebookFilterProps {
  type: Extract<CodebookType, "city" | "faculty" | "study_program" | "scholarship_type">
  title: string
  value?: string
  onChange: (value?: string) => void
}

function CodebookFilter({ type, title, value, onChange }: CodebookFilterProps) {
  const { data = [], isPending } = useCodebooks(type)
  const options = useMemo(
    () => data.map((item) => ({ value: item.id, label: item.name })),
    [data],
  )

  return (
    <DataTableFacetedFilter
      title={title}
      value={value}
      options={options}
      onValueChange={onChange}
      searchPlaceholder={`Pretraži: ${title.toLocaleLowerCase("hr")}`}
      emptyMessage="Nema odgovarajućih stavki."
      disabled={isPending}
    />
  )
}

const dateInputValue = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

export default function StudentsPage() {
  const [filters, setFilters] = useState<StudentFilters>(defaultFilters)
  const [search, setSearch] = useState("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const { data, isPending } = useAdminStudents(filters)

  const set = (patch: Partial<StudentFilters>) =>
    setFilters((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? "1",
    }))

  const activeFilterCount = filterKeys.filter((key) => Boolean(filters[key])).length
  const advancedFilterCount = advancedFilterKeys.filter((key) =>
    Boolean(filters[key]),
  ).length

  const clearFilters = () => {
    setSearch("")
    setFilters(defaultFilters)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Studenti</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Brzo pronađite studente i precizirajte rezultate dodatnim filtrima.
          </p>
        </div>
        <Button variant="outline" onClick={() => exportAdminStudents(filters)}>
          <DownloadIcon />
          Izvezi CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <form
          className="flex flex-col gap-2 border-b p-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            set({ search: search.trim() || undefined })
          }}
        >
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Pretraži po imenu, prezimenu ili e-mailu..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Button type="submit">Pretraži</Button>
        </form>

        <div className="space-y-3 p-3">
          <div
            role="toolbar"
            aria-label="Filtri studenata"
            className="flex flex-wrap items-center gap-2"
          >
            <CodebookFilter
              type="city"
              title="Grad"
              value={filters.cityId}
              onChange={(cityId) => set({ cityId })}
            />
            <CodebookFilter
              type="faculty"
              title="Fakultet"
              value={filters.facultyId}
              onChange={(facultyId) => set({ facultyId })}
            />
            <DataTableFacetedFilter
              title="Godina studija"
              value={filters.currentStudyYear}
              options={studyYearOptions}
              onValueChange={(currentStudyYear) => set({ currentStudyYear })}
            />
            <DataTableFacetedFilter
              title="Status studija"
              value={filters.studyStatus}
              options={studyStatusOptions}
              onValueChange={(studyStatus) =>
                set({ studyStatus: studyStatus as StudentFilters["studyStatus"] })
              }
            />
            <Button
              type="button"
              variant="outline"
              className="border-dashed font-normal"
              aria-expanded={showMoreFilters}
              aria-controls="additional-student-filters"
              onClick={() => setShowMoreFilters((current) => !current)}
            >
              <SlidersHorizontalIcon className="text-muted-foreground" />
              Dodatni filtri
              {advancedFilterCount > 0 && (
                <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                  {advancedFilterCount}
                </Badge>
              )}
              <ChevronDownIcon
                className={cn(
                  "text-muted-foreground transition-transform",
                  showMoreFilters && "rotate-180",
                )}
              />
            </Button>
            {activeFilterCount > 0 && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <FilterXIcon />
                Očisti filtre
                <span className="text-muted-foreground">({activeFilterCount})</span>
              </Button>
            )}

            <div className="flex w-full items-center gap-2 border-t pt-3 sm:ml-auto sm:w-auto sm:border-0 sm:pt-0">
              <Select
                value={filters.sort ?? "lastName"}
                onValueChange={(value) =>
                  set({ sort: value as StudentFilters["sort"] })
                }
              >
                <SelectTrigger className="min-w-44 flex-1 border-dashed sm:flex-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="lastName">Sortiraj: prezime</SelectItem>
                  <SelectItem value="firstName">Sortiraj: ime</SelectItem>
                  <SelectItem value="updatedAt">Sortiraj: ažuriranje</SelectItem>
                  <SelectItem value="completionPercentage">
                    Sortiraj: dovršenost
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={
                  filters.order === "desc"
                    ? "Promijeni u uzlazni poredak"
                    : "Promijeni u silazni poredak"
                }
                title={filters.order === "desc" ? "Silazno" : "Uzlazno"}
                onClick={() =>
                  set({ order: filters.order === "desc" ? "asc" : "desc" })
                }
              >
                {filters.order === "desc" ? (
                  <ArrowDownWideNarrowIcon />
                ) : (
                  <ArrowUpNarrowWideIcon />
                )}
              </Button>
            </div>
          </div>

          {showMoreFilters && (
            <div
              id="additional-student-filters"
              className="grid gap-4 rounded-lg border bg-muted/30 p-3 lg:grid-cols-[minmax(0,1fr)_15rem_minmax(18rem,0.7fr)]"
            >
              <div className="space-y-2">
                <Label>Dodatni kriteriji</Label>
                <div className="flex flex-wrap gap-2">
                  <CodebookFilter
                    type="study_program"
                    title="Studijski program"
                    value={filters.studyProgramId}
                    onChange={(studyProgramId) => set({ studyProgramId })}
                  />
                  <CodebookFilter
                    type="scholarship_type"
                    title="Vrsta stipendije"
                    value={filters.scholarshipTypeId}
                    onChange={(scholarshipTypeId) => set({ scholarshipTypeId })}
                  />
                  <DataTableFacetedFilter
                    title="Status stipendije"
                    value={filters.scholarshipStatus}
                    options={scholarshipStatusOptions}
                    onValueChange={(scholarshipStatus) =>
                      set({
                        scholarshipStatus:
                          scholarshipStatus as StudentFilters["scholarshipStatus"],
                      })
                    }
                  />
                  <DataTableFacetedFilter
                    title="Potvrda profila"
                    value={filters.verification}
                    options={verificationOptions}
                    onValueChange={(verification) =>
                      set({
                        verification: verification as StudentFilters["verification"],
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic-year">Akademska godina</Label>
                <Input
                  id="academic-year"
                  placeholder="npr. 2026/2027"
                  value={filters.academicYear ?? ""}
                  onChange={(event) =>
                    set({ academicYear: event.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Vrijeme ažuriranja</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="updated-after"
                      className="text-xs font-normal text-muted-foreground"
                    >
                      Od
                    </Label>
                    <Input
                      id="updated-after"
                      type="date"
                      value={dateInputValue(filters.updatedAfter)}
                      onChange={(event) =>
                        set({
                          updatedAfter: event.target.value
                            ? new Date(
                              `${event.target.value}T00:00:00`,
                            ).toISOString()
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="updated-before"
                      className="text-xs font-normal text-muted-foreground"
                    >
                      Do
                    </Label>
                    <Input
                      id="updated-before"
                      type="date"
                      value={dateInputValue(filters.updatedBefore)}
                      onChange={(event) =>
                        set({
                          updatedBefore: event.target.value
                            ? new Date(
                              `${event.target.value}T23:59:59`,
                            ).toISOString()
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Studij</TableHead>
                <TableHead>Godina / status</TableHead>
                <TableHead>Profil</TableHead>
                <TableHead>Potvrda</TableHead>
                <TableHead className="w-14" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    Učitavanje...
                  </TableCell>
                </TableRow>
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    Nema rezultata za odabrane filtre.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <p className="font-medium">
                        {student.lastName}, {student.firstName}
                      </p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                      {!student.isActive && (
                        <Badge variant="destructive" className="mt-1">
                          Deaktiviran
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="max-w-64 truncate text-sm">
                        {student.studyProgramName ?? "-"}
                      </p>
                      <p className="max-w-64 truncate text-xs text-muted-foreground">
                        {student.facultyName ?? student.cityName ?? "Nije uneseno"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>
                        {student.currentStudyYear
                          ? `${student.currentStudyYear}. godina`
                          : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {statusLabels[student.studyStatus ?? ""] ?? "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {student.completionPercentage}%
                        </span>
                        <div className="h-1.5 w-16 rounded bg-slate-100">
                          <div
                            className="h-1.5 rounded bg-primary"
                            style={{ width: `${student.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.verifiedAcademicYear ? (
                        <Badge variant="secondary">{student.verifiedAcademicYear}</Badge>
                      ) : (
                        <Badge variant="outline">Nije potvrđen</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          to={`/admin/students/${student.id}`}
                          aria-label="Otvori profil"
                        >
                          <EyeIcon />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {data?.meta && (
          <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              Ukupno {data.meta.total} · Stranica {data.meta.page} od{" "}
              {Math.max(1, data.meta.totalPages)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data.meta.hasPreviousPage}
                onClick={() => set({ page: String(data.meta.page - 1) })}
              >
                <ChevronLeftIcon />
                Prethodna
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!data.meta.hasNextPage}
                onClick={() => set({ page: String(data.meta.page + 1) })}
              >
                Sljedeća
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
