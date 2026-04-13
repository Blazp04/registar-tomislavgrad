import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch, queryClient } from "./apiClient";
import type { paths } from "@/types/api";

type CodebookItem = NonNullable<
  paths["/api/codebooks/{type}"]["get"]["responses"]["200"]["content"]["application/json"]["data"]
>[number];

type CodebookType = "faculty" | "field_of_study" | "high_school_profession" | "city";

export function useCodebooks(type: CodebookType) {
  return useQuery({
    queryKey: ["codebooks", type],
    queryFn: () =>
      apiFetch<{ success: boolean; data: CodebookItem[] }>(
        `/api/codebooks/${type}`
      ).then((r) => r.data),
  });
}

export function useCreateCodebook() {
  return useMutation({
    mutationFn: (data: { type: CodebookType; name: string }) =>
      apiFetch<{ success: boolean; data: CodebookItem }>("/api/codebooks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["codebooks", variables.type] });
    },
    meta: { successMessage: "Stavka je uspješno dodana" },
  });
}

export function useDeleteCodebook() {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/codebooks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codebooks"] });
    },
    meta: { successMessage: "Stavka je uspješno obrisana" },
  });
}

export function useUpdateCodebook() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiFetch<{ success: boolean; data: CodebookItem }>(`/api/codebooks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codebooks"] });
    },
    meta: { successMessage: "Stavka je uspješno ažurirana" },
  });
}

export type { CodebookItem, CodebookType };
