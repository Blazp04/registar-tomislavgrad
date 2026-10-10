import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2Icon, KeyRoundIcon, LinkIcon, MailCheckIcon } from "lucide-react";
import { useRequestPasswordReset, useResetPassword } from "@/services/auth";
import { AuthShell, FormError, StatusIcon } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusIcon = (icon: React.ReactNode, tone: "brand" | "success" = "brand") => <StatusIcon tone={tone}>{icon}</StatusIcon>;

export function ForgotPasswordPage() {
  const mutation = useRequestPasswordReset();
  const [email, setEmail] = useState("");

  if (mutation.isSuccess) return (
    <AuthShell icon={statusIcon(<MailCheckIcon />, "success")} title="Provjerite e-mail" description="Poruku ćete dobiti ako račun s tom adresom postoji.">
      <Button asChild variant="outline" size="lg" className="w-full"><Link to="/login">Povratak na prijavu</Link></Button>
    </AuthShell>
  );

  return (
    <AuthShell
      icon={statusIcon(<KeyRoundIcon />)}
      title="Obnova lozinke"
      description="Ako račun postoji, poslat ćemo sigurnu poveznicu za promjenu lozinke."
      footer={<Link to="/login" className="font-medium text-primary hover:underline">Povratak na prijavu</Link>}
    >
      <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); mutation.mutate(email); }}>
        <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" placeholder="ime@primjer.com" className="h-11" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
        <Button className="w-full" size="lg" disabled={mutation.isPending}>Pošalji poveznicu</Button>
      </form>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [search] = useSearchParams();
  const mutation = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const token = search.get("token") ?? "";
  const [error, setError] = useState("");

  if (!token) return (
    <AuthShell icon={statusIcon(<LinkIcon />)} title="Poveznica nije valjana" description="Poveznica je istekla ili je neispravna. Zatražite novu.">
      <Button asChild size="lg" className="w-full"><Link to="/forgot-password">Zatraži novu poveznicu</Link></Button>
    </AuthShell>
  );

  if (mutation.isSuccess) return (
    <AuthShell icon={statusIcon(<CheckCircle2Icon />, "success")} title="Lozinka je promijenjena" description="Sada se možete prijaviti novom lozinkom.">
      <Button asChild size="lg" className="w-full"><Link to="/login">Prijavi se</Link></Button>
    </AuthShell>
  );

  return (
    <AuthShell icon={statusIcon(<KeyRoundIcon />)} title="Postavite novu lozinku" description="Lozinka mora imati najmanje 10 znakova.">
      <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); setError(""); if (password.length < 10) return setError("Lozinka mora imati najmanje 10 znakova"); if (password !== confirmation) return setError("Lozinke se ne podudaraju"); mutation.mutate({ token, newPassword: password }); }}>
        {(error || mutation.error) && <FormError>{error || mutation.error?.message}</FormError>}
        <div className="space-y-2"><Label htmlFor="password">Nova lozinka</Label><Input id="password" type="password" minLength={10} className="h-11" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="confirmation">Potvrda lozinke</Label><Input id="confirmation" type="password" minLength={10} className="h-11" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
        <Button className="w-full" size="lg" disabled={mutation.isPending}>Spremi lozinku</Button>
      </form>
    </AuthShell>
  );
}
