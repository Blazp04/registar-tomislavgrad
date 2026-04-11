import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { useQuery, useMutation } from "@tanstack/react-query";
import { API_BASE_URL, queryClient } from "./apiClient";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [jwtClient()],
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") || "",
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        localStorage.setItem("bearer_token", authToken);
      }
    },
  },
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
  });

  return {
    data: query.data ?? null,
    isPending: query.isPending,
    error: query.error,
  };
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("bearer_token");
      await signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(["session"], null);
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      const result = await signIn.email({
        email: params.email,
        password: params.password,
      });
      if (result.error)
        throw new Error(result.error.message ?? "Prijava nije uspjela");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (params: {
      email: string;
      password: string;
      name: string;
    }) => {
      const result = await signUp.email({
        email: params.email,
        password: params.password,
        name: params.name,
      });
      if (result.error)
        throw new Error(result.error.message ?? "Registracija nije uspjela");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
