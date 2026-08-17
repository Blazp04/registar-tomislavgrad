import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useRequestPasswordReset, useResetPassword } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordPage() {
  const mutation = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  return <section className="mx-auto max-w-md px-5 py-20"><Card><CardHeader><CardTitle>Obnova lozinke</CardTitle><p className="text-sm text-muted-foreground">Ako račun postoji, poslat ćemo sigurnu poveznicu za promjenu lozinke.</p></CardHeader><CardContent>{mutation.isSuccess ? <div className="space-y-4 text-sm"><p>Provjerite e-mail. Poruku ćete dobiti i ako račun s tom adresom postoji.</p><Button asChild variant="outline"><Link to="/login">Povratak na prijavu</Link></Button></div> : <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); mutation.mutate(email); }}><div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div><Button className="w-full" disabled={mutation.isPending}>Pošalji poveznicu</Button></form>}</CardContent></Card></section>;
}

export function ResetPasswordPage() {
  const [search] = useSearchParams();
  const mutation = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const token = search.get("token") ?? "";
  const [error, setError] = useState("");
  if (!token) return <section className="mx-auto max-w-md px-5 py-20 text-center"><h1 className="text-2xl font-semibold">Poveznica nije valjana</h1><Button asChild className="mt-5"><Link to="/forgot-password">Zatraži novu poveznicu</Link></Button></section>;
  if (mutation.isSuccess) return <section className="mx-auto max-w-md px-5 py-20 text-center"><h1 className="text-2xl font-semibold">Lozinka je promijenjena</h1><Button asChild className="mt-5"><Link to="/login">Prijavi se</Link></Button></section>;
  return <section className="mx-auto max-w-md px-5 py-20"><Card><CardHeader><CardTitle>Postavite novu lozinku</CardTitle></CardHeader><CardContent><form className="space-y-5" onSubmit={(event) => { event.preventDefault(); setError(""); if (password.length < 10) return setError("Lozinka mora imati najmanje 10 znakova"); if (password !== confirmation) return setError("Lozinke se ne podudaraju"); mutation.mutate({ token, newPassword: password }); }}>{(error || mutation.error) && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error || mutation.error?.message}</p>}<div className="space-y-2"><Label htmlFor="password">Nova lozinka</Label><Input id="password" type="password" minLength={10} required value={password} onChange={(event) => setPassword(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="confirmation">Potvrda lozinke</Label><Input id="confirmation" type="password" minLength={10} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div><Button className="w-full" disabled={mutation.isPending}>Spremi lozinku</Button></form></CardContent></Card></section>;
}
