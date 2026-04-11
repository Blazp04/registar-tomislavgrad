import { LoginForm } from "@/components/login-form"
import { useSession } from "@/lib/auth-client"
import { Navigate } from "react-router"

export default function LoginPage() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
  if (session) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          Registar Tomislavgrad
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
