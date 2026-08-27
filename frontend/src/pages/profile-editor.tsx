import { useState } from "react";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { CodebookSelect } from "@/components/codebook-select";
import { useConfirmProfile, useDeleteEducation, useProfile, useSaveEducation, useUpdateProfile, type Education, type EducationInput, type Profile } from "@/services/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const steps = ["Osobni podaci", "Srednja škola", "Studij", "Pregled i potvrda"];
const emptyHighSchool: EducationInput = { type: "high_school", countryId: null, cityId: null, highSchoolId: null, highSchoolProgram: null, graduationYear: null, universityId: null, facultyId: null, studyProgramId: null, studyLevelId: null, studyMode: null, firstEnrollmentYear: null, currentStudyYear: null, expectedGraduationYear: null, studyStatus: null, isCurrent: false };
const emptyStudy: EducationInput = { type: "higher_education", countryId: null, cityId: null, highSchoolId: null, highSchoolProgram: null, graduationYear: null, universityId: null, facultyId: null, studyProgramId: null, studyLevelId: null, studyMode: "full_time", firstEnrollmentYear: null, currentStudyYear: null, expectedGraduationYear: null, studyStatus: "active", isCurrent: true };

const toInput = (education: Education): EducationInput => ({ type: education.type, countryId: education.countryId, cityId: education.cityId, highSchoolId: education.highSchoolId, highSchoolProgram: education.highSchoolProgram, graduationYear: education.graduationYear, universityId: education.universityId, facultyId: education.facultyId, studyProgramId: education.studyProgramId, studyLevelId: education.studyLevelId, studyMode: education.studyMode, firstEnrollmentYear: education.firstEnrollmentYear, currentStudyYear: education.currentStudyYear, expectedGraduationYear: education.expectedGraduationYear, studyStatus: education.studyStatus, isCurrent: education.isCurrent });
const numberOrNull = (value: string) => value ? Number(value) : null;

function PersonalStep({ profile, next }: { profile: Profile; next: () => void }) {
  const mutation = useUpdateProfile();
  const [form, setForm] = useState({ firstName: profile.firstName, lastName: profile.lastName, birthDate: profile.birthDate ?? "", address: profile.address ?? "", settlementId: profile.settlementId, phone: profile.phone ?? "" });
  return <Card><CardHeader><CardTitle>Osobni i kontaktni podaci</CardTitle><p className="text-sm text-muted-foreground">Polja označena zvjezdicom potrebna su za dovršen profil.</p></CardHeader><CardContent><form className="space-y-5" onSubmit={async (event) => { event.preventDefault(); await mutation.mutateAsync({ firstName: form.firstName, lastName: form.lastName, birthDate: form.birthDate || null, address: form.address || null, settlementId: form.settlementId, phone: form.phone || null }); next(); }}>
    <div className="grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label htmlFor="firstName">Ime *</Label><Input id="firstName" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></div><div className="space-y-2"><Label htmlFor="lastName">Prezime *</Label><Input id="lastName" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></div><div className="space-y-2"><Label>E-mail</Label><Input value={profile.email} disabled /><p className="text-xs text-muted-foreground">Za promjenu e-maila pošaljite zahtjev za ispravak.</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="birthDate">Datum rođenja *</Label><Input id="birthDate" type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} required /></div><div className="space-y-2"><Label htmlFor="phone">Broj telefona *</Label><Input id="phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></div></div>
    <div className="space-y-2"><Label htmlFor="address">Adresa prebivališta *</Label><Input id="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required /></div>
    <CodebookSelect type="municipality_settlement" label="Naselje prebivališta" value={form.settlementId} onChange={(settlementId) => setForm({ ...form, settlementId })} required />
    <div className="flex justify-end"><Button disabled={mutation.isPending}>{mutation.isPending ? "Spremam..." : "Spremi i nastavi"}<ChevronRightIcon /></Button></div>
  </form></CardContent></Card>;
}

function HighSchoolStep({ existing, back, next }: { existing?: Education; back: () => void; next: () => void }) {
  const mutation = useSaveEducation();
  const [form, setForm] = useState<EducationInput>(existing ? toInput(existing) : emptyHighSchool);
  return <Card><CardHeader><CardTitle>Srednjoškolsko obrazovanje</CardTitle><p className="text-sm text-muted-foreground">Unesite završenu srednju školu i smjer ili zanimanje.</p></CardHeader><CardContent><form className="space-y-5" onSubmit={async (event) => { event.preventDefault(); await mutation.mutateAsync({ id: existing?.id, data: form }); next(); }}>
    <div className="grid gap-4 sm:grid-cols-2"><CodebookSelect type="high_school" label="Naziv škole" value={form.highSchoolId} onChange={(highSchoolId) => setForm({ ...form, highSchoolId })} required /><CodebookSelect type="city" label="Mjesto škole" value={form.cityId} onChange={(cityId) => setForm({ ...form, cityId })} required /></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="highSchoolProgram">Smjer ili zanimanje *</Label><Input id="highSchoolProgram" value={form.highSchoolProgram ?? ""} onChange={(event) => setForm({ ...form, highSchoolProgram: event.target.value || null })} required /></div><div className="space-y-2"><Label htmlFor="graduationYear">Godina završetka *</Label><Input id="graduationYear" type="number" min="1950" max={new Date().getFullYear() + 1} value={form.graduationYear ?? ""} onChange={(event) => setForm({ ...form, graduationYear: numberOrNull(event.target.value) })} required /></div></div>
    <div className="flex justify-between"><Button type="button" variant="outline" onClick={back}><ChevronLeftIcon />Natrag</Button><Button disabled={mutation.isPending}>Spremi i nastavi<ChevronRightIcon /></Button></div>
  </form></CardContent></Card>;
}

function StudyForm({ education, cancel, saved }: { education?: Education; cancel?: () => void; saved: () => void }) {
  const mutation = useSaveEducation();
  const [form, setForm] = useState<EducationInput>(education ? toInput(education) : emptyStudy);
  return <form className="space-y-5 rounded-xl border bg-slate-50 p-4 sm:p-5" onSubmit={async (event) => { event.preventDefault(); await mutation.mutateAsync({ id: education?.id, data: form }); saved(); }}>
    <div className="grid gap-4 sm:grid-cols-2"><CodebookSelect type="country" label="Država studiranja" value={form.countryId} onChange={(countryId) => setForm({ ...form, countryId })} required /><CodebookSelect type="city" label="Grad studiranja" value={form.cityId} onChange={(cityId) => setForm({ ...form, cityId })} required /></div>
    <div className="grid gap-4 sm:grid-cols-2"><CodebookSelect type="university" label="Sveučilište ili visoko učilište" value={form.universityId} onChange={(universityId) => setForm({ ...form, universityId })} required /><CodebookSelect type="faculty" label="Fakultet" value={form.facultyId} onChange={(facultyId) => setForm({ ...form, facultyId })} required /></div>
    <div className="grid gap-4 sm:grid-cols-2"><CodebookSelect type="study_program" label="Studijski program ili smjer" value={form.studyProgramId} onChange={(studyProgramId) => setForm({ ...form, studyProgramId })} required /><CodebookSelect type="study_level" label="Razina studija" value={form.studyLevelId} onChange={(studyLevelId) => setForm({ ...form, studyLevelId })} required /></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2"><Label>Način studiranja *</Label><Select value={form.studyMode ?? ""} onValueChange={(studyMode) => setForm({ ...form, studyMode: studyMode as EducationInput["studyMode"] })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full_time">Redovito</SelectItem><SelectItem value="part_time">Izvanredno</SelectItem><SelectItem value="distance">Na daljinu</SelectItem><SelectItem value="other">Drugo</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label>Godina prvog upisa *</Label><Input type="number" min="1950" max={new Date().getFullYear() + 1} value={form.firstEnrollmentYear ?? ""} onChange={(event) => setForm({ ...form, firstEnrollmentYear: numberOrNull(event.target.value) })} required /></div>
      <div className="space-y-2"><Label>Trenutačna godina *</Label><Input type="number" min="1" max="10" value={form.currentStudyYear ?? ""} onChange={(event) => setForm({ ...form, currentStudyYear: numberOrNull(event.target.value) })} required /></div>
      <div className="space-y-2"><Label>Očekivani završetak *</Label><Input type="number" min="1950" max={new Date().getFullYear() + 15} value={form.expectedGraduationYear ?? ""} onChange={(event) => setForm({ ...form, expectedGraduationYear: numberOrNull(event.target.value) })} required /></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Status studija *</Label><Select value={form.studyStatus ?? ""} onValueChange={(studyStatus) => setForm({ ...form, studyStatus: studyStatus as EducationInput["studyStatus"] })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktivan</SelectItem><SelectItem value="paused">Mirovanje</SelectItem><SelectItem value="completed">Završen</SelectItem><SelectItem value="withdrawn">Prekinut</SelectItem></SelectContent></Select></div><label className="flex items-center gap-3 self-end rounded-lg border bg-white p-3 text-sm"><input type="checkbox" checked={form.isCurrent} onChange={(event) => setForm({ ...form, isCurrent: event.target.checked })} /> Ovo je moj trenutačni studij</label></div>
    <div className="flex justify-end gap-2">{cancel && <Button type="button" variant="ghost" onClick={cancel}>Odustani</Button>}<Button disabled={mutation.isPending}>Spremi studij</Button></div>
  </form>;
}

function StudiesStep({ studies, back, next }: { studies: Education[]; back: () => void; next: () => void }) {
  const remove = useDeleteEducation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(studies.length === 0);
  const labels: Record<string, string> = { active: "Aktivan", paused: "Mirovanje", completed: "Završen", withdrawn: "Prekinut" };
  return <Card><CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle>Visokoškolsko obrazovanje</CardTitle><p className="mt-1 text-sm text-muted-foreground">Sačuvajte prethodne studije i označite trenutačni.</p></div><Button type="button" variant="outline" onClick={() => { setAdding(true); setEditingId(null); }}><PlusIcon />Dodaj studij</Button></div></CardHeader><CardContent className="space-y-4">
    {studies.map((study) => editingId === study.id ? <StudyForm key={study.id} education={study} cancel={() => setEditingId(null)} saved={() => setEditingId(null)} /> : <div key={study.id} className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{study.studyProgramName ?? "Studijski program"}</p>{study.isCurrent && <Badge>Trenutačni</Badge>}<Badge variant="outline">{labels[study.studyStatus ?? ""] ?? "-"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{study.facultyName ?? "Fakultet"} · {study.cityName ?? "Grad"}{study.currentStudyYear ? ` · ${study.currentStudyYear}. godina` : ""}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setEditingId(study.id); setAdding(false); }}>Uredi</Button><Button variant="ghost" size="icon" className="text-destructive" aria-label="Ukloni studij" onClick={() => { if (confirm("Ukloniti ovaj zapis studija?")) remove.mutate(study.id); }}><Trash2Icon /></Button></div></div>)}
    {adding && <StudyForm cancel={studies.length ? () => setAdding(false) : undefined} saved={() => setAdding(false)} />}
    <div className="flex justify-between pt-3"><Button type="button" variant="outline" onClick={back}><ChevronLeftIcon />Natrag</Button><Button type="button" onClick={next} disabled={studies.length === 0}>Nastavi na pregled<ChevronRightIcon /></Button></div>
  </CardContent></Card>;
}

function ReviewStep({ profile, highSchool, studies, scholarshipCount, back }: { profile: Profile; highSchool?: Education; studies: Education[]; scholarshipCount: number; back: () => void }) {
  const confirmProfile = useConfirmProfile();
  return <div className="space-y-4"><Card><CardHeader><CardTitle>Pregled podataka</CardTitle><p className="text-sm text-muted-foreground">Prije godišnje potvrde provjerite jesu li podaci potpuni i aktualni.</p></CardHeader><CardContent className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Osobni podaci", `${profile.firstName} ${profile.lastName}`], ["Srednja škola", highSchool?.highSchoolName ?? "Nije unesena"], ["Broj studija", studies.length], ["Stipendije", scholarshipCount]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>)}</div>
    <div className="rounded-xl border p-5"><div className="flex items-center justify-between"><div><p className="font-medium">Dovršenost profila</p><p className="mt-1 text-sm text-muted-foreground">Sva obavezna polja moraju biti unesena.</p></div><span className="text-2xl font-semibold">{profile.completionPercentage}%</span></div><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-primary" style={{ width: `${profile.completionPercentage}%` }} /></div></div>
    <div className="flex flex-col justify-between gap-3 sm:flex-row"><Button type="button" variant="outline" onClick={back}><ChevronLeftIcon />Natrag</Button><Button type="button" disabled={profile.completionPercentage < 100 || confirmProfile.isPending} onClick={() => confirmProfile.mutate()}><CheckIcon />Potvrdi podatke za aktualnu godinu</Button></div>
  </CardContent></Card></div>;
}

export default function ProfileEditorPage() {
  const { data, isPending, error } = useProfile();
  const [step, setStep] = useState(0);
  if (isPending) return <div className="grid min-h-[50vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (error || !data) return <p className="rounded-xl bg-destructive/10 p-4 text-destructive">Profil nije moguće učitati.</p>;
  const highSchool = data.educations.find((item) => item.type === "high_school");
  const studies = data.educations.filter((item) => item.type === "higher_education");
  return <div className="space-y-6"><div><h1 className="text-3xl font-semibold tracking-tight">Moj profil</h1><p className="mt-2 text-muted-foreground">Podaci se spremaju nakon svakog koraka pa se možete vratiti kasnije.</p></div>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{steps.map((label, index) => <button key={label} onClick={() => setStep(index)} className={`rounded-xl border p-3 text-left text-xs transition sm:text-sm ${index === step ? "border-primary bg-primary/5 text-primary" : index < step ? "bg-white" : "bg-slate-50 text-muted-foreground"}`}><span className="mr-2 font-semibold">{index + 1}.</span>{label}</button>)}</div>
    {step === 0 && <PersonalStep profile={data.profile} next={() => setStep(1)} />}
    {step === 1 && <HighSchoolStep existing={highSchool} back={() => setStep(0)} next={() => setStep(2)} />}
    {step === 2 && <StudiesStep studies={studies} back={() => setStep(1)} next={() => setStep(3)} />}
    {step === 3 && <ReviewStep profile={data.profile} highSchool={highSchool} studies={studies} scholarshipCount={data.scholarships.length} back={() => setStep(2)} />}
  </div>;
}
