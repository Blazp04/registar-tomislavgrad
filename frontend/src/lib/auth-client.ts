// Re-export from services — all auth logic lives in services/auth.ts
export {
  authClient,
  signIn,
  signUp,
  signOut,
  useSession,
  useLogout,
  useLogin,
  useRegister,
} from "@/services/auth";
export { queryClient } from "@/services/apiClient";

