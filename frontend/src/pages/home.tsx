import { useState } from "react"
import { useCodebooks } from "@/services/codebooks"
import { useCreateStudent } from "@/services/students"
import { createStudentSchema } from "@/lib/validation"
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
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2Icon } from "lucide-react"

const DUMMY_UUID = "00000000-0000-0000-0000-000000000000"

const initialForm = {
  firstName: "",
  lastName: "",
  fatherName: "",
  email: "",
  address: "",
  phone: "",
  isCurrentStudent: true,
  isEmployed: false,
  isWorkingInField: false,
  // High school
  highSchoolType: "" as "" | "gimnazija" | "strukovna",
  highSchoolDuration: "" as "" | "trogodisnja" | "cetverogodisnja" | "petogodisnja",
  highSchoolProfessionId: "",
  highSchoolCityId: "",
  customHighSchoolProfessionName: "",
  // Faculty
  facultyId: "",
  fieldOfStudyId: "",
  facultyCityId: "",
  customFacultyName: "",
  customFieldOfStudyName: "",
  customCityName: "",
}

export default function HomePage() {
  const { data: faculties } = useCodebooks("faculty")
  const { data: fields } = useCodebooks("field_of_study")
  const { data: professions } = useCodebooks("high_school_profession")
  const { data: cities } = useCodebooks("city")
  const createStudent = useCreateStudent()

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const useFacultyOther = form.facultyId === "other"
  const useFieldOther = form.fieldOfStudyId === "other"
  const useProfessionOther = form.highSchoolProfessionId === "other"

  const isGimnazija = form.highSchoolType === "gimnazija"

  const FieldError = ({ field }: { field: string }) => {
    if (!fieldErrors[field]) return null
    return <p className="mt-1 text-xs text-red-600">{fieldErrors[field]}</p>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    const payload: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      fatherName: form.fatherName,
      email: form.email,
      address: form.address,
      phone: form.phone,
      isCurrentStudent: form.isCurrentStudent,
      isEmployed: form.isEmployed,
      isWorkingInField: form.isEmployed ? form.isWorkingInField : false,
      highSchoolType: form.highSchoolType,
      highSchoolDuration: isGimnazija ? "cetverogodisnja" : form.highSchoolDuration,
      highSchoolProfessionId: isGimnazija ? undefined : (useProfessionOther ? DUMMY_UUID : form.highSchoolProfessionId || undefined),
      highSchoolCityId: form.highSchoolCityId === "other" ? DUMMY_UUID : form.highSchoolCityId,
      facultyId: useFacultyOther ? DUMMY_UUID : form.facultyId,
      fieldOfStudyId: useFieldOther ? DUMMY_UUID : form.fieldOfStudyId,
      facultyCityId: form.facultyCityId === "other" ? DUMMY_UUID : form.facultyCityId,
    }

    if (useProfessionOther && !isGimnazija) {
      if (!form.customHighSchoolProfessionName.trim()) {
        setError("Unesite naziv struke")
        return
      }
      payload.customHighSchoolProfessionName = form.customHighSchoolProfessionName.trim()
    }
    if (form.highSchoolCityId === "other" || form.facultyCityId === "other") {
      if (!form.customCityName.trim()) {
        setError("Unesite naziv grada")
        return
      }
      payload.customCityName = form.customCityName.trim()
    }

    if (useFacultyOther) {
      if (!form.customFacultyName.trim()) {
        setError("Unesite naziv fakulteta")
        return
      }
      payload.customFacultyName = form.customFacultyName.trim()
    }
    if (useFieldOther) {
      if (!form.customFieldOfStudyName.trim()) {
        setError("Unesite naziv struke")
        return
      }
      payload.customFieldOfStudyName = form.customFieldOfStudyName.trim()
    }

    try {
      // Validate with Zod before submitting
      const result = createStudentSchema.safeParse(payload)
      if (!result.success) {
        const errors: Record<string, string> = {}
        for (const issue of result.error.issues) {
          const path = issue.path.join(".")
          if (!errors[path]) errors[path] = issue.message
        }
        setFieldErrors(errors)
        setError("Molimo ispravite greške u obrascu")
        return
      }
      await createStudent.mutateAsync(payload as any)
      setSubmitted(true)
    } catch (err: any) {
      // Handle server-side validation errors
      if (err.message) {
        try {
          const body = JSON.parse(err.message)
          if (body?.error?.errors) {
            const errors: Record<string, string> = {}
            for (const [field, msgs] of Object.entries(body.error.errors)) {
              errors[field] = (msgs as string[]).join(", ")
            }
            setFieldErrors(errors)
          }
        } catch {
          // Not JSON, use as-is
        }
      }
      setError(err.message ?? "Greška pri slanju podataka")
    }
  }

  if (submitted) {
    return (
      <div className="min-h-svh bg-white">
        <header className="border-b border-gray-200 bg-[#c0392b]">
          <div className="mx-auto flex h-14 items-center justify-between px-6">
            <span className="text-sm font-semibold text-white">Općina Tomislavgrad</span>
          </div>
        </header>
        <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2Icon className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Prijava uspješno poslana</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Vaši podaci su zabilježeni u registar studenata općine Tomislavgrad.
            Kontaktirat ćemo vas po potrebi.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm(initialForm) }}
            className="mt-8 rounded-lg bg-[#c0392b] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a93226]"
          >
            Nova prijava
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-20 items-center gap-4 px-6">
          <img
            src="/grb-tomislavgrad.png"
            alt="Grb općine Tomislavgrad"
            className="h-14 w-auto"
          />
        </div>
      </header>

      {/* Hero banner */}
      <section className="bg-[#c0392b]">
        <div className="mx-auto px-6 py-10 md:py-14">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Registar studenata općine Tomislavgrad
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-red-100 md:text-base">
            Općina Tomislavgrad vodi evidenciju studenata s područja općine kako bi pratila
            obrazovne trendove, planirala podršku studentima i održavala kontakt sa
            mladim obrazovanim ljudima iz naše zajednice.
          </p>
        </div>
      </section>

      {/* Registration form — full width */}
      <section className="px-6 py-8">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Form header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 md:px-8">
            <h2 className="text-lg font-bold text-gray-900">Prijava u registar</h2>
            <p className="mt-1 text-sm text-gray-500">
              Popunite obrazac sa vašim podacima. Sva polja su obavezna.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
            {/* Osobni podaci */}
            <div className="px-6 py-6 md:px-8">
              <h3 className="mb-4 text-sm font-semibold text-[#c0392b]">Osobni podaci</h3>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm text-gray-700">Ime</Label>
                  <Input
                    id="firstName"
                    required
                    placeholder="Marko"
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    className={fieldErrors.firstName ? "border-red-500" : ""}
                  />
                  <FieldError field="firstName" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm text-gray-700">Prezime</Label>
                  <Input
                    id="lastName"
                    required
                    placeholder="Marković"
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    className={fieldErrors.lastName ? "border-red-500" : ""}
                  />
                  <FieldError field="lastName" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fatherName" className="text-sm text-gray-700">Ime oca</Label>
                  <Input
                    id="fatherName"
                    required
                    placeholder="Ivan"
                    value={form.fatherName}
                    onChange={(e) => setForm((p) => ({ ...p, fatherName: e.target.value }))}
                    className={fieldErrors.fatherName ? "border-red-500" : ""}
                  />
                  <FieldError field="fatherName" />
                </div>
              </div>
              <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="marko@example.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className={fieldErrors.email ? "border-red-500" : ""}
                  />
                  <FieldError field="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm text-gray-700">Broj telefona</Label>
                  <Input
                    id="phone"
                    required
                    placeholder="063 123 456"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className={fieldErrors.phone ? "border-red-500" : ""}
                  />
                  <FieldError field="phone" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm text-gray-700">Adresa</Label>
                  <Input
                    id="address"
                    required
                    placeholder="Ul. kralja Tomislava 10"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className={fieldErrors.address ? "border-red-500" : ""}
                  />
                  <FieldError field="address" />
                </div>
              </div>
            </div>

            {/* Srednja škola */}
            <div className="px-6 py-6 md:px-8">
              <h3 className="mb-4 text-sm font-semibold text-[#c0392b]">Srednja škola</h3>
              <div className="space-y-4">
                <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">Vrsta srednje škole</Label>
                    <Select
                      value={form.highSchoolType}
                      onValueChange={(v) => setForm((p) => ({
                        ...p,
                        highSchoolType: v as "gimnazija" | "strukovna",
                        highSchoolDuration: v === "gimnazija" ? "cetverogodisnja" : "",
                        highSchoolProfessionId: v === "gimnazija" ? "" : p.highSchoolProfessionId,
                      }))}
                    >
                      <SelectTrigger className={`w-full ${fieldErrors.highSchoolType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Odaberite vrstu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gimnazija">Gimnazija</SelectItem>
                        <SelectItem value="strukovna">Strukovna</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError field="highSchoolType" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">Trajanje</Label>
                    {isGimnazija ? (
                      <Input value="Četverogodišnja" disabled className="bg-gray-100" />
                    ) : (
                      <Select
                        value={form.highSchoolDuration}
                        onValueChange={(v) => setForm((p) => ({ ...p, highSchoolDuration: v as any }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Odaberite trajanje" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trogodisnja">Trogodišnja</SelectItem>
                          <SelectItem value="cetverogodisnja">Četverogodišnja</SelectItem>
                          <SelectItem value="petogodisnja">Petogodišnja</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <FieldError field="highSchoolDuration" />
                  </div>
                </div>
                {form.highSchoolType === "strukovna" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm text-gray-700">Struka</Label>
                    <Select
                      value={form.highSchoolProfessionId}
                      onValueChange={(v) => setForm((p) => ({ ...p, highSchoolProfessionId: v, customHighSchoolProfessionName: "" }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Odaberite struku" />
                      </SelectTrigger>
                      <SelectContent>
                        {professions?.map((f) => (
                          <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>
                        ))}
                        <SelectItem value="other">Drugo (unesite ručno)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError field="highSchoolProfessionId" />
                    {useProfessionOther && (
                      <Input
                        className="mt-2"
                        placeholder="Unesite naziv struke"
                        value={form.customHighSchoolProfessionName}
                        onChange={(e) => setForm((p) => ({ ...p, customHighSchoolProfessionName: e.target.value }))}
                      />
                    )}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700">Grad (srednja škola)</Label>
                  <Select
                    value={form.highSchoolCityId}
                    onValueChange={(v) => setForm((p) => ({ ...p, highSchoolCityId: v, customCityName: v === "other" ? p.customCityName : "" }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Odaberite grad" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((f) => (
                        <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>
                      ))}
                      <SelectItem value="other">Drugo (unesite ručno)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field="highSchoolCityId" />
                  {form.highSchoolCityId === "other" && (
                    <Input
                      className="mt-2"
                      placeholder="Unesite naziv grada"
                      value={form.customCityName}
                      onChange={(e) => setForm((p) => ({ ...p, customCityName: e.target.value }))}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Obrazovanje — each field full width */}
            <div className="px-6 py-6 md:px-8">
              <h3 className="mb-4 text-sm font-semibold text-[#c0392b]">Fakultet</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700">Fakultet</Label>
                  <Select
                    value={form.facultyId}
                    onValueChange={(v) => setForm((p) => ({ ...p, facultyId: v, customFacultyName: "" }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Odaberite fakultet" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties?.map((f) => (
                        <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>
                      ))}
                      <SelectItem value="other">Drugo (unesite ručno)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field="facultyId" />
                  {useFacultyOther && (
                    <Input
                      className="mt-2"
                      placeholder="Unesite puno ime fakulteta"
                      value={form.customFacultyName}
                      onChange={(e) => setForm((p) => ({ ...p, customFacultyName: e.target.value }))}
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700">Smjer</Label>
                  <Select
                    value={form.fieldOfStudyId}
                    onValueChange={(v) => setForm((p) => ({ ...p, fieldOfStudyId: v, customFieldOfStudyName: "" }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Odaberite smjer" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields?.map((f) => (
                        <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>
                      ))}
                      <SelectItem value="other">Drugo (unesite ručno)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field="fieldOfStudyId" />
                  {useFieldOther && (
                    <Input
                      className="mt-2"
                      placeholder="Unesite naziv smjera"
                      value={form.customFieldOfStudyName}
                      onChange={(e) => setForm((p) => ({ ...p, customFieldOfStudyName: e.target.value }))}
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700">Grad (fakultet)</Label>
                  <Select
                    value={form.facultyCityId}
                    onValueChange={(v) => setForm((p) => ({ ...p, facultyCityId: v, customCityName: v === "other" ? p.customCityName : "" }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Odaberite grad" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((f) => (
                        <SelectItem key={f.id} value={f.id!}>{f.name}</SelectItem>
                      ))}
                      <SelectItem value="other">Drugo (unesite ručno)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field="facultyCityId" />
                  {form.facultyCityId === "other" && (
                    <Input
                      className="mt-2"
                      placeholder="Unesite naziv grada"
                      value={form.customCityName}
                      onChange={(e) => setForm((p) => ({ ...p, customCityName: e.target.value }))}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="px-6 py-6 md:px-8">
              <h3 className="mb-4 text-sm font-semibold text-[#c0392b]">Status</h3>
              <div className="space-y-3">
                <label htmlFor="isCurrentStudent" className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[[data-state=checked]]:border-[#c0392b]/30 has-[[data-state=checked]]:bg-red-50/50">
                  <Checkbox
                    id="isCurrentStudent"
                    checked={form.isCurrentStudent}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isCurrentStudent: !!v }))}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Trenutno sam student</div>
                    <div className="text-xs text-gray-500">Pohađam fakultet ili visoku školu</div>
                  </div>
                </label>

                <label htmlFor="isEmployed" className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[[data-state=checked]]:border-[#c0392b]/30 has-[[data-state=checked]]:bg-red-50/50">
                  <Checkbox
                    id="isEmployed"
                    checked={form.isEmployed}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isEmployed: !!v, isWorkingInField: false }))}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Trenutno sam zaposlen/a</div>
                    <div className="text-xs text-gray-500">Zaposlenje na puno ili nepuno radno vrijeme</div>
                  </div>
                </label>

                {form.isEmployed && (
                  <label htmlFor="isWorkingInField" className="ml-7 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[[data-state=checked]]:border-[#c0392b]/30 has-[[data-state=checked]]:bg-red-50/50">
                    <Checkbox
                      id="isWorkingInField"
                      checked={form.isWorkingInField}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, isWorkingInField: !!v }))}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Radim u struci</div>
                      <div className="text-xs text-gray-500">Posao odgovara smjeru mog obrazovanja</div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Error + Submit */}
            <div className="bg-gray-50 px-6 py-5 md:px-8">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <p className="hidden text-xs text-gray-400 sm:block">
                  Vaši podaci se koriste isključivo u svrhu evidencije studenata.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={createStudent.isPending}
                  className="w-full bg-[#c0392b] text-white hover:bg-[#a93226] sm:w-auto"
                >
                  {createStudent.isPending ? "Šaljem..." : "Pošalji prijavu"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#2c3e50]">
        <div className="mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <div className="text-sm font-semibold text-white">Općina Tomislavgrad</div>
              <div className="mt-1 text-xs text-gray-400">
                Hercegbosanska županija · Federacija Bosne i Hercegovine
              </div>
            </div>
            <div className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Općina Tomislavgrad. Sva prava pridržana.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
