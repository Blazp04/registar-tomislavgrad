import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { CheckCircle2Icon } from "lucide-react";
import { useLogin, useSession } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const login = useLogin();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (login.isSuccess) navigate(login.data?.user.role === "admin" ? "/admin" : "/app", { replace: true });
  }, [login.isSuccess, login.data, navigate]);

  if (isPending) return <div className="grid min-h-[60vh] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (session) return <Navigate to={session.user.role === "admin" ? "/admin" : "/app"} replace />;

  return (
    <section className="mx-auto max-w-md px-5 py-16 md:py-24">
      {search.get("verified") === "1" && <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2Icon className="h-5 w-5" /> E-mail je potvrđen. Sada se možete prijaviti.</div>}
      <Card className="shadow-lg shadow-slate-950/5">
        <CardHeader><CardTitle className="text-2xl">Prijava u registar</CardTitle><p className="text-sm text-muted-foreground">Pristupite studentskom profilu ili administraciji.</p></CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); login.mutate({ email, password }); }}>
            {login.error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{login.error.message}</div>}
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password">Lozinka</Label><Link to="/forgot-password" className="text-xs text-primary hover:underline">Zaboravljena lozinka?</Link></div><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
            <Button className="w-full" size="lg" disabled={login.isPending}>{login.isPending ? "Prijavljujem..." : "Prijavi se"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">Nemate račun? <Link to="/register" className="font-medium text-primary hover:underline">Registrirajte se</Link></p>
        </CardContent>
      </Card>
    </section>
  );
}
