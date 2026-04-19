import { QueryClient, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

const runtimeConfig = window.__APP_CONFIG__;

export const API_BASE_URL =
  runtimeConfig?.VITE_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = (mutation.options.meta as any)?.successMessage as string | undefined;
      if (message) {
        toast.success(message);
      }
    },
    onError: (error, _variables, _context, mutation) => {
      const message =
        (mutation.options.meta as any)?.errorMessage as string | undefined;
      toast.error(message ?? error.message ?? "Došlo je do greške");
    },
  }),
});

function getAuthToken(): string {
  return localStorage.getItem("bearer_token") || "";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error?.message ?? `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
