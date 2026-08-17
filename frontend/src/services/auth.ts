import { useMutation, useQuery } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { API_BASE_URL, queryClient } from "./apiClient";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: true },
        lastName: { type: "string", required: true },
        role: { type: "string", required: true, input: false },
        isActive: { type: "boolean", required: true, input: false },
      },
    }),
  ],
  fetchOptions: { credentials: "include" },
});

export const { signIn, signUp, signOut } = authClient;

export function useSession() {
  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await authClient.getSession();
      if (response.error) return null;
      return response.data;
    },
    staleTime: 30_000,
  });
  return { data: query.data ?? null, isPending: query.isPending, error: query.error };
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const result = await signOut();
      if (result.error) throw new Error(result.error.message ?? "Odjava nije uspjela");
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.assign("/");
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      const result = await signIn.email(params);
      if (result.error) throw new Error(result.error.message ?? "Prijava nije uspjela");
      return result.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session"] }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (params: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      termsAccepted: boolean;
      privacyAccepted: boolean;
    }) => {
      const result = await signUp.email({
        name: `${params.firstName} ${params.lastName}`,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        password: params.password,
        callbackURL: `${window.location.origin}/login?verified=1`,
        termsAccepted: params.termsAccepted,
        privacyAccepted: params.privacyAccepted,
        termsVersion: "2026-08-17",
        privacyVersion: "2026-08-17",
      } as Parameters<typeof signUp.email>[0]);
      if (result.error) throw new Error(result.error.message ?? "Registracija nije uspjela");
      return result.data;
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) throw new Error(result.error.message ?? "Zahtjev nije moguće poslati");
      return result.data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const result = await authClient.resetPassword({ token, newPassword });
      if (result.error) throw new Error(result.error.message ?? "Lozinku nije moguće promijeniti");
      return result.data;
    },
  });
}
