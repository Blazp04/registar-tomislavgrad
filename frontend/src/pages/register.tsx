import { useState } from "react";
import { Link } from "react-router";
import { ArrowRightIcon, MailCheckIcon } from "lucide-react";
import { useRegister } from "@/services/auth";
import { AuthShell, FormError, StatusIcon } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const register = useRegister();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", termsAccepted: false, privacyAccepted: false });
  const [localError, setLocalError] = useState("");

  if (register.isSuccess) return (
    <AuthShell
      icon={<StatusIcon tone="success"><MailCheckIcon /></StatusIcon>}
      title="Provjerite svoj e-mail"
      description="Poslali smo poveznicu za potvrdu adrese. Nakon potvrde možete se prijaviti i dopuniti profil."
    >
      <Button asChild size="lg" className="w-full"><Link to="/login">Povratak na prijavu</Link></Button>
    </AuthShell>
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
    <AuthShell
      wide
      title="Kreirajte korisnički račun"
      description="Za početak trebamo samo osnovne podatke. Profil obrazovanja dopunit ćete nakon prijave."
      footer={<>Već imate račun? <Link to="/login" className="font-medium text-primary hover:underline">Prijavite se</Link></>}
    >
      <form className="space-y-5" onSubmit={submit}>
        {(localError || register.error) && <FormError>{localError || register.error?.message}</FormError>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="firstName">Ime *</Label><Input id="firstName" autoComplete="given-name" className="h-11" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="lastName">Prezime *</Label><Input id="lastName" autoComplete="family-name" className="h-11" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="email">E-mail *</Label><Input id="email" type="email" autoComplete="email" placeholder="ime@primjer.com" className="h-11" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="password">Lozinka *</Label><Input id="password" type="password" autoComplete="new-password" minLength={10} className="h-11" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><p className="text-xs text-muted-foreground">Najmanje 10 znakova</p></div>
          <div className="space-y-2"><Label htmlFor="confirmPassword">Potvrda lozinke *</Label><Input id="confirmPassword" type="password" autoComplete="new-password" minLength={10} className="h-11" required value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /></div>
        </div>
        <div className="space-y-3 rounded-lg border bg-surface p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-5"><Checkbox className="mt-0.5" checked={form.termsAccepted} onCheckedChange={(value) => setForm({ ...form, termsAccepted: value === true })} /><span>Prihvaćam <Link to="/terms" target="_blank" className="font-medium text-primary underline underline-offset-2">uvjete korištenja</Link>.</span></label>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-5"><Checkbox className="mt-0.5" checked={form.privacyAccepted} onCheckedChange={(value) => setForm({ ...form, privacyAccepted: value === true })} /><span>Pročitao/la sam i prihvaćam <Link to="/privacy" target="_blank" className="font-medium text-primary underline underline-offset-2">politiku privatnosti</Link>.</span></label>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={register.isPending}>
          {register.isPending ? "Kreiram račun..." : <>Registriraj se <ArrowRightIcon /></>}
        </Button>
      </form>
    </AuthShell>
  );
}
