import { useMemo, useState } from "react";
import { DownloadIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router";
import { downloadOwnData, useCreateDataRequest, useDeactivateAccount, useProfile, useRecordConsent, type DataRequest } from "@/services/registry";
import { useLogout } from "@/services/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const requestLabels: Record<DataRequest["type"], string> = { correction: "Ispravak podataka", export: "Službeni izvoz", restriction: "Ograničenje obrade", deletion: "Brisanje podataka" };
const statusLabels: Record<DataRequest["status"], string> = { submitted: "Zaprimljen", in_review: "U obradi", completed: "Dovršen", rejected: "Odbijen" };

export default function PrivacyCenterPage() {
  const { data, isPending } = useProfile();
  const consent = useRecordConsent();
  const createRequest = useCreateDataRequest();
  const deactivate = useDeactivateAccount();
  const logout = useLogout();
  const navigate = useNavigate();
  const [type, setType] = useState<DataRequest["type"]>("correction");
  const [details, setDetails] = useState("");
  const latestOptional = useMemo(() => data?.consents.find((item) => item.type === "optional_updates"), [data]);
  if (isPending || !data) return <div className="grid min-h-[40vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  const optionalAccepted = latestOptional?.accepted === true && !latestOptional.withdrawnAt;
  return <div className="space-y-6"><div><h1 className="text-3xl font-semibold tracking-tight">Privatnost i moji podaci</h1><p className="mt-2 text-muted-foreground">Pregledajte privole, preuzmite podatke ili pošaljite zahtjev administraciji.</p></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5" />Privole</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-medium">Uvjeti korištenja i politika privatnosti</p><p className="mt-1 text-muted-foreground">Prihvaćeno pri registraciji. Sustav čuva verziju i vrijeme prihvaćanja.</p></div><label className="flex items-start gap-3 rounded-xl border p-4"><Checkbox checked={optionalAccepted} onCheckedChange={(value) => consent.mutate(value === true)} /><span><span className="block text-sm font-medium">Neobavezne obavijesti o registru</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Privolu možete povući u svakom trenutku. Povlačenje ne utječe na osnovnu evidenciju.</span></span></label></CardContent></Card>
      <Card><CardHeader><CardTitle>Preuzmite kopiju podataka</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">Izvoz uključuje profil, obrazovanje, stipendije, privole i vaše zahtjeve u strojno čitljivom JSON formatu.</p><Button className="mt-5" variant="outline" onClick={() => downloadOwnData()}><DownloadIcon />Preuzmi moje podatke</Button></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Pošaljite zahtjev</CardTitle><p className="text-sm text-muted-foreground">Administracija će evidentirati i obraditi zahtjev. Brisanje i ograničenje ovise o zakonskim i administrativnim uvjetima.</p></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-[240px_1fr_auto] md:items-end" onSubmit={async (event) => { event.preventDefault(); await createRequest.mutateAsync({ type, details: details || null }); setDetails(""); }}><div className="space-y-2"><Label>Vrsta zahtjeva</Label><Select value={type} onValueChange={(value) => setType(value as DataRequest["type"])}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(requestLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="details">Obrazloženje (neobavezno)</Label><Textarea id="details" value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Opišite što je potrebno ispraviti ili razlog zahtjeva" /></div><Button disabled={createRequest.isPending}>Pošalji zahtjev</Button></form></CardContent></Card>
    <Card><CardHeader><CardTitle>Moji zahtjevi</CardTitle></CardHeader><CardContent>{data.dataRequests.length === 0 ? <p className="text-sm text-muted-foreground">Još niste poslali nijedan zahtjev.</p> : <div className="space-y-3">{data.dataRequests.map((item) => <div key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"><div><p className="font-medium">{requestLabels[item.type]}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("hr-HR")}{item.resolutionNote ? ` · ${item.resolutionNote}` : ""}</p></div><Badge variant="secondary">{statusLabels[item.status]}</Badge></div>)}</div>}</CardContent></Card>
    <Card className="border-destructive/20"><CardHeader><CardTitle className="text-destructive">Deaktivacija računa</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">Deaktivacijom se odmah onemogućuje prijava, ali se podaci ne brišu automatski zbog pravila čuvanja. Za brisanje pošaljite zaseban zahtjev.</p><Button className="mt-4" variant="destructive" onClick={async () => { if (!confirm("Deaktivirati račun? Nakon odjave više se nećete moći prijaviti bez pomoći administracije.")) return; await deactivate.mutateAsync(); await logout.mutateAsync(); navigate("/"); }}><Trash2Icon />Deaktiviraj račun</Button></CardContent></Card>
  </div>;
}
