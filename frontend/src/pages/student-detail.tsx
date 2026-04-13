import { useState } from "react"
import { useParams, Link } from "react-router"
import { useStudent } from "@/services/students"
import { useStudentNotifications, type NotificationItem } from "@/services/notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeftIcon, MailIcon, MessageSquareIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const highSchoolTypeLabels: Record<string, string> = {
  gimnazija: "Gimnazija",
  strukovna: "Strukovna",
}

const highSchoolDurationLabels: Record<string, string> = {
  trogodisnja: "3-godišnja",
  cetverogodisnja: "4-godišnja",
  petogodisnja: "5-godišnja",
}

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateShort(dateStr: string | undefined | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="text-sm font-medium text-muted-foreground min-w-[160px]">{label}</span>
      <span className="text-sm">{value ?? "—"}</span>
    </div>
  )
}

function NotificationHistory({ studentId }: { studentId: string }) {
  const [page, setPage] = useState(1)
  const { data, isPending } = useStudentNotifications(studentId, page, 20)

  const items = data?.items ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Tip</TableHead>
              <TableHead className="w-[160px]">Datum</TableHead>
              <TableHead className="w-[150px]">Pošiljatelj</TableHead>
              <TableHead>Naslov / Sadržaj</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="h-6 w-6 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nema poslanih obavijesti
                </TableCell>
              </TableRow>
            ) : (
              items.map((n: NotificationItem) => (
                <TableRow key={n.id}>
                  <TableCell>
                    {n.type === "email" ? (
                      <Badge variant="secondary" className="gap-1">
                        <MailIcon className="h-3 w-3" />
                        Email
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                        <MessageSquareIcon className="h-3 w-3" />
                        SMS
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(n.sentAt)}</TableCell>
                  <TableCell className="text-sm">{n.senderName ?? "Sustav"}</TableCell>
                  <TableCell className="max-w-[400px]">
                    {n.subject && (
                      <p className="text-sm font-medium truncate">{n.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">{n.content}</p>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Ukupno: {meta.total} obavijesti — Stranica {meta.page} od {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: student, isPending } = useStudent(id!)

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <Link to="/admin/students">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Natrag na popis
          </Button>
        </Link>
        <p className="text-center text-muted-foreground py-8">Student nije pronađen</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/students">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{student.firstName} {student.lastName}</h1>
          <p className="text-sm text-muted-foreground">
            Upisano: {formatDateShort(student.createdAt)}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={student.isCurrentStudent ? "default" : "secondary"}>
            {student.isCurrentStudent ? "Trenutni student" : "Bivši student"}
          </Badge>
          {student.isEmployed ? (
            <Badge className="bg-green-600 hover:bg-green-700">
              {student.isWorkingInField ? "Zaposlen u struci" : "Zaposlen"}
            </Badge>
          ) : (
            <Badge variant="outline">Nezaposlen</Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalji</TabsTrigger>
          <TabsTrigger value="notifications">Povijest obavijesti</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          {/* Personal info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Osobni podaci</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Ime" value={student.firstName} />
              <InfoRow label="Prezime" value={student.lastName} />
              <InfoRow label="Ime oca" value={student.fatherName} />
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Adresa" value={student.address} />
              <InfoRow label="Telefon" value={student.phone} />
            </CardContent>
          </Card>

          {/* High school */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Srednja škola</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Tip" value={highSchoolTypeLabels[student.highSchoolType ?? ""] ?? student.highSchoolType} />
              <InfoRow label="Trajanje" value={highSchoolDurationLabels[student.highSchoolDuration ?? ""] ?? student.highSchoolDuration} />
              <InfoRow label="Zanimanje" value={student.highSchoolProfessionName ?? "—"} />
              <InfoRow label="Grad" value={student.highSchoolCityName} />
            </CardContent>
          </Card>

          {/* Faculty */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fakultet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Naziv" value={student.facultyName} />
              <InfoRow label="Smjer" value={student.fieldOfStudyName} />
              <InfoRow label="Grad" value={student.facultyCityName} />
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="Status studenta"
                value={
                  <Badge variant={student.isCurrentStudent ? "default" : "secondary"}>
                    {student.isCurrentStudent ? "Trenutni student" : "Bivši student"}
                  </Badge>
                }
              />
              <InfoRow
                label="Zaposlenost"
                value={
                  student.isEmployed ? (
                    <Badge className="bg-green-600 hover:bg-green-700">
                      {student.isWorkingInField ? "Zaposlen u struci" : "Zaposlen"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Nezaposlen</Badge>
                  )
                }
              />
              <InfoRow label="Datum upisa" value={formatDate(student.createdAt)} />
              <InfoRow label="Zadnja izmjena" value={formatDate(student.updatedAt)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationHistory studentId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
