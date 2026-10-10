import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";
import { useLogin, useSession } from "@/services/auth";
import { AuthShell, FormError } from "@/components/auth-shell";
import { Spinner } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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

  if (isPending) return <Spinner className="min-h-[60vh]" />;
  if (session) return <Navigate to={session.user.role === "admin" ? "/admin" : "/app"} replace />;

  return (
    <AuthShell
      title="Prijava u registar"
      description="Pristupite studentskom profilu ili administraciji."
      footer={<>Nemate račun? <Link to="/register" className="font-medium text-primary hover:underline">Registrirajte se</Link></>}
    >
      <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); login.mutate({ email, password }); }}>
        {search.get("verified") === "1" && (
          <div className="flex items-center gap-2.5 rounded-md border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <CheckCircle2Icon className="size-4 shrink-0" /> E-mail je potvrđen. Sada se možete prijaviti.
          </div>
        )}
        {login.error && <FormError>{login.error.message}</FormError>}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="ime@primjer.com" className="h-11" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Lozinka</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Zaboravljena lozinka?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" className="h-11" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <Button className="w-full" size="lg" disabled={login.isPending}>
          {login.isPending ? "Prijavljujem..." : <>Prijavi se <ArrowRightIcon /></>}
        </Button>
      </form>
    </AuthShell>
  );
}
