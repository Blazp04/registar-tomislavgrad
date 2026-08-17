import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const runtimeConfig = window.__APP_CONFIG__;
export const API_BASE_URL = runtimeConfig?.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = (mutation.options.meta as { successMessage?: string } | undefined)?.successMessage;
      if (message) toast.success(message);
    },
    onError: (error, _variables, _context, mutation) => {
      const message = (mutation.options.meta as { errorMessage?: string } | undefined)?.errorMessage;
      toast.error(message ?? error.message ?? "Došlo je do pogreške");
    },
  }),
});

async function readError(response: Response) {
  const body = await response.json().catch(() => null);
  const fields = body?.error?.errors as Record<string, string[]> | undefined;
  const fieldMessage = fields ? Object.values(fields).flat()[0] : undefined;
  return fieldMessage ?? body?.error?.message ?? body?.message ?? `Zahtjev nije uspio (${response.status})`;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(await readError(response));
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiDownload(path: string, filename: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: "include" });
  if (!response.ok) throw new Error(await readError(response));
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
