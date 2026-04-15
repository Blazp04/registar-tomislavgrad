import { useState } from "react"
import { useStudents, useDeleteStudent, useSendBulkSms, useSendBulkEmail, type StudentFilters } from "@/services/students"
import { useCodebooks } from "@/services/codebooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { SearchIcon, MessageSquareIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, FilterXIcon, MailIcon, EyeIcon, DownloadIcon } from "lucide-react"
import { Link } from "react-router"
import * as XLSX from "xlsx"

const highSchoolTypeLabels: Record<string, string> = {
  gimnazija: "Gimnazija",
  strukovna: "Strukovna",
}

const highSchoolDurationLabels: Record<string, string> = {
  trogodisnja: "3-godišnja",
  cetverogodisnja: "4-godišnja",
  petogodisnja: "5-godišnja",
}

export default function StudentsPage() {
  const [filters, setFilters] = useState<StudentFilters>({ page: "1", limit: "20" })
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [smsOpen, setSmsOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [smsTemplate, setSmsTemplate] = useState(
    "Poštovani/a {ime} {prezime}, pozivamo Vas na ..."
  )
  const [emailSubject, setEmailSubject] = useState("Obavijest — Općina Tomislavgrad")
  const [emailTemplate, setEmailTemplate] = useState(
    "Poštovani/a {ime} {prezime},\n\nPozivamo Vas na ..."
  )

  const { data, isPending } = useStudents({ ...filters, search: search || undefined })
  const { data: faculties } = useCodebooks("faculty")
  const { data: fields } = useCodebooks("field_of_study")
  const deleteStudent = useDeleteStudent()
  const sendSms = useSendBulkSms()
  const sendEmail = useSendBulkEmail()

  const students = data?.items ?? []
  const meta = data?.meta

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(students.map((s) => s.id!)))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovog studenta?")) return
    await deleteStudent.mutateAsync(id)
  }

  const handleSendSms = async () => {
    if (selectedIds.size === 0) return
    await sendSms.mutateAsync({
      studentIds: Array.from(selectedIds),
      messageTemplate: smsTemplate,
    })
    setSmsOpen(false)
    setSelectedIds(new Set())
  }

  const handleSendEmail = async () => {
    if (selectedIds.size === 0) return
    await sendEmail.mutateAsync({
      studentIds: Array.from(selectedIds),
      subject: emailSubject,
      messageTemplate: emailTemplate,
    })
    setEmailOpen(false)
    setSelectedIds(new Set())
  }

  const handleExportExcel = () => {
    const selected = students.filter((s) => selectedIds.has(s.id!))
    if (selected.length === 0) return

    const rows = selected.map((s) => ({
      "Ime": s.firstName,
      "Prezime": s.lastName,
      "Ime oca": s.fatherName,
      "Email": s.email,
      "Telefon": s.phone,
      "Adresa": s.address,
      "Srednja škola — tip": highSchoolTypeLabels[s.highSchoolType ?? ""] ?? "",
      "Srednja škola — trajanje": highSchoolDurationLabels[s.highSchoolDuration ?? ""] ?? "",
      "Srednja škola — struka": s.highSchoolProfessionName ?? "",
      "Grad srednje škole": s.highSchoolCityName ?? "",
      "Fakultet": s.facultyName ?? "",
      "Smjer": s.fieldOfStudyName ?? "",
      "Grad fakulteta": s.facultyCityName ?? "",
      "Status": s.isCurrentStudent ? "Trenutni student" : "Bivši student",
      "Zaposlen": s.isEmployed ? "Da" : "Ne",
      "Radi u struci": s.isWorkingInField ? "Da" : "Ne",
    }))

    const ws = XLSX.utils.json_to_sheet(rows)

    // Auto-size columns
    const colWidths = Object.keys(rows[0]).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length)
      )
      return { wch: Math.min(maxLen + 2, 40) }
    })
    ws["!cols"] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Studenti")
    XLSX.writeFile(wb, `studenti-export-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const updateFilter = (key: keyof StudentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: "1" }))
  }

  const clearFilters = () => {
    setFilters({ page: "1", limit: "20" })
    setSearch("")
  }

  const hasActiveFilters = !!(
    filters.facultyId ||
    filters.fieldOfStudyId ||
    filters.isCurrentStudent ||
    filters.isEmployed ||
    filters.isWorkingInField ||
    search
  )

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pretraži po imenu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filters.facultyId ?? ""} onValueChange={(v) => updateFilter("facultyId", v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Svi fakulteti" />
          </SelectTrigger>
          <SelectContent>
            {faculties?.map((f) => (
              <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.fieldOfStudyId ?? ""} onValueChange={(v) => updateFilter("fieldOfStudyId", v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sve struke" />
          </SelectTrigger>
          <SelectContent>
            {fields?.map((f) => (
              <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.isCurrentStudent ?? ""} onValueChange={(v) => updateFilter("isCurrentStudent", v)}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Status studenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Trenutni studenti</SelectItem>
            <SelectItem value="false">Bivši studenti</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.isEmployed ?? ""} onValueChange={(v) => updateFilter("isEmployed", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Zaposlenost" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Zaposleni</SelectItem>
            <SelectItem value="false">Nezaposleni</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <FilterXIcon className="mr-1 h-4 w-4" />
            Očisti filtere
          </Button>
        )}
      </div>

      {/* Actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">
            Odabrano: <strong>{selectedIds.size}</strong>
          </span>
          <Button size="sm" onClick={() => setSmsOpen(true)}>
            <MessageSquareIcon className="mr-1 h-4 w-4" />
            Pošalji SMS
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEmailOpen(true)}>
            <MailIcon className="mr-1 h-4 w-4" />
            Pošalji Email
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportExcel}>
            <DownloadIcon className="mr-1 h-4 w-4" />
            Izvezi u Excel
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={students.length > 0 && selectedIds.size === students.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Ime i prezime</TableHead>
              <TableHead>Ime oca</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Srednja škola</TableHead>
              <TableHead>Fakultet</TableHead>
              <TableHead>Smjer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Zaposlenost</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="h-6 w-6 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nema studenata za prikaz
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(s.id!)}
                      onCheckedChange={() => toggleSelect(s.id!)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/admin/students/${s.id}`} className="text-primary hover:underline underline-offset-4">
                      {s.firstName} {s.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{s.fatherName}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell className="max-w-[180px] truncate" title={`${highSchoolTypeLabels[s.highSchoolType ?? ""] ?? ""} ${highSchoolDurationLabels[s.highSchoolDuration ?? ""] ?? ""} ${s.highSchoolProfessionName ? `— ${s.highSchoolProfessionName}` : ""} (${s.highSchoolCityName ?? ""})`}>
                    <span className="text-xs">
                      {highSchoolTypeLabels[s.highSchoolType ?? ""] ?? ""}{" "}
                      {highSchoolDurationLabels[s.highSchoolDuration ?? ""] ?? ""}
                      {s.highSchoolProfessionName ? ` — ${s.highSchoolProfessionName}` : ""}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={`${s.facultyName} (${s.facultyCityName ?? ""})`}>
                    {s.facultyName}{s.facultyCityName ? ` (${s.facultyCityName})` : ""}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={s.fieldOfStudyName}>
                    {s.fieldOfStudyName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.isCurrentStudent ? "default" : "secondary"}>
                      {s.isCurrentStudent ? "Trenutni" : "Bivši"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.isEmployed ? (
                      <Badge variant="default" className="bg-green-600">
                        {s.isWorkingInField ? "U struci" : "Zaposlен"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Nezaposlen</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/students/${s.id}`}>
                        <Button variant="ghost" size="icon">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(s.id!)}
                        className="text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages! > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Ukupno: {meta.total} studenata — Stranica {meta.page} od {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setFilters((p) => ({ ...p, page: String((meta.page ?? 1) - 1) }))}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setFilters((p) => ({ ...p, page: String((meta.page ?? 1) + 1) }))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* SMS Dialog */}
      <Dialog open={smsOpen} onOpenChange={setSmsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pošalji SMS poruku</DialogTitle>
            <DialogDescription>
              Pišite poruku koristeći {"{ime}"} i {"{prezime}"} kao varijable.
              Poruke će biti ispisane u backend konzolu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Odabrano studenata: <strong>{selectedIds.size}</strong>
            </p>
            <Textarea
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              rows={5}
              placeholder="Poštovani/a {ime} {prezime}, ..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSmsOpen(false)}>Odustani</Button>
            <Button onClick={handleSendSms} disabled={sendSms.isPending}>
              {sendSms.isPending ? "Šaljem..." : "Pošalji"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pošalji Email</DialogTitle>
            <DialogDescription>
              Pišite poruku koristeći {"{ime}"} i {"{prezime}"} kao varijable.
              Email će biti poslan na adrese odabranih studenata.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Odabrano studenata: <strong>{selectedIds.size}</strong>
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Naslov</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Naslov emaila..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Poruka</label>
              <Textarea
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                rows={6}
                placeholder="Poštovani/a {ime} {prezime}, ..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Odustani</Button>
            <Button onClick={handleSendEmail} disabled={sendEmail.isPending}>
              <MailIcon className="mr-1 h-4 w-4" />
              {sendEmail.isPending ? "Šaljem..." : "Pošalji email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
