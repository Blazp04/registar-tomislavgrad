import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLogin, useRegister } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const login = useLogin()
  const register = useRegister()

  const mutation = isLogin ? login : register
  const error = mutation.error?.message ?? ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isLogin) {
      login.mutate({ email, password })
    } else {
      register.mutate({ email, password, name })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {isLogin ? "Dobrodošli nazad" : "Kreirajte račun"}
                </h1>
                <p className="text-balance text-muted-foreground">
                  {isLogin
                    ? "Unesite podatke za prijavu"
                    : "Unesite podatke za registraciju"}
                </p>
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {!isLogin && (
                <Field>
                  <FieldLabel htmlFor="name">Ime</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Vaše ime"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="ime@primjer.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Lozinka</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={mutation.isPending} className="w-full">
                  {mutation.isPending
                    ? "Učitavanje..."
                    : isLogin
                      ? "Prijava"
                      : "Registracija"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                {isLogin ? "Nemate račun?" : "Već imate račun?"}{" "}
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-primary"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    mutation.reset()
                  }}
                >
                  {isLogin ? "Registrirajte se" : "Prijavite se"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
