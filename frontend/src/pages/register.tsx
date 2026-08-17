import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2Icon } from "lucide-react";
import { useRegister } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const register = useRegister();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", termsAccepted: false, privacyAccepted: false });
  const [localError, setLocalError] = useState("");

  if (register.isSuccess) return (
    <section className="mx-auto max-w-lg px-5 py-20 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2Icon /></div>
      <h1 className="mt-5 text-3xl font-semibold">Provjerite svoj e-mail</h1>
      <p className="mt-3 leading-7 text-slate-600">Poslali smo poveznicu za potvrdu adrese. Nakon potvrde možete se prijaviti i dopuniti profil.</p>
      <Button asChild className="mt-7"><Link to="/login">Povratak na prijavu</Link></Button>
    </section>
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError("");
    if (form.password !== form.confirmPassword) return setLocalError("Lozinke se ne podudaraju");
    if (form.password.length < 10) return setLocalError("Lozinka mora imati najmanje 10 znakova");
    if (!form.termsAccepted || !form.privacyAccepted) return setLocalError("Za registraciju je potrebno prihvatiti uvjete i politiku privatnosti");
    register.mutate(form);
  };

  return (
    <section className="mx-auto max-w-xl px-5 py-14 md:py-20">
      <Card className="shadow-lg shadow-slate-950/5">
        <CardHeader><CardTitle className="text-2xl">Kreirajte korisnički račun</CardTitle><p className="text-sm leading-6 text-muted-foreground">Za početak trebamo samo osnovne podatke. Profil obrazovanja dopunit ćete nakon prijave.</p></CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            {(localError || register.error) && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{localError || register.error?.message}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="firstName">Ime *</Label><Input id="firstName" autoComplete="given-name" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="lastName">Prezime *</Label><Input id="lastName" autoComplete="family-name" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="email">E-mail *</Label><Input id="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="password">Lozinka *</Label><Input id="password" type="password" autoComplete="new-password" minLength={10} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><p className="text-xs text-muted-foreground">Najmanje 10 znakova</p></div>
              <div className="space-y-2"><Label htmlFor="confirmPassword">Potvrda lozinke *</Label><Input id="confirmPassword" type="password" autoComplete="new-password" minLength={10} required value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /></div>
            </div>
            <div className="space-y-3 rounded-xl border bg-slate-50 p-4">
              <label className="flex items-start gap-3 text-sm"><Checkbox checked={form.termsAccepted} onCheckedChange={(value) => setForm({ ...form, termsAccepted: value === true })} /><span>Prihvaćam <Link to="/terms" target="_blank" className="text-primary underline">uvjete korištenja</Link>.</span></label>
              <label className="flex items-start gap-3 text-sm"><Checkbox checked={form.privacyAccepted} onCheckedChange={(value) => setForm({ ...form, privacyAccepted: value === true })} /><span>Pročitao/la sam i prihvaćam <Link to="/privacy" target="_blank" className="text-primary underline">politiku privatnosti</Link>.</span></label>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={register.isPending}>{register.isPending ? "Kreiram račun..." : "Registriraj se"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">Već imate račun? <Link to="/login" className="font-medium text-primary hover:underline">Prijavite se</Link></p>
        </CardContent>
      </Card>
    </section>
  );
}
