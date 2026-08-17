import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch, queryClient } from "./apiClient";

export const codebookTypes = ["country", "city", "municipality_settlement", "high_school", "university", "faculty", "study_program", "study_level", "scholarship_type", "scholarship_provider"] as const;
export type CodebookType = (typeof codebookTypes)[number];
export interface CodebookItem { id: string; type: CodebookType; name: string; isOfficial: boolean; createdAt: string; updatedAt: string }
type Response<T> = { success: true; data: T };

export function useCodebooks(type: CodebookType, admin = false) {
  return useQuery({ queryKey: ["codebooks", type, admin], queryFn: () => apiFetch<Response<CodebookItem[]>>(`${admin ? "/api/admin" : "/api"}/codebooks/${type}`).then((r) => r.data) });
}

export function useSuggestCodebook() {
  return useMutation({ mutationFn: (data: { type: CodebookType; name: string }) => apiFetch<Response<CodebookItem>>("/api/codebooks/suggestions", { method: "POST", body: JSON.stringify(data) }).then((r) => r.data), onSuccess: (_data, values) => queryClient.invalidateQueries({ queryKey: ["codebooks", values.type] }), meta: { successMessage: "Vrijednost je spremljena za provjeru" } });
}

export function useCreateCodebook() {
  return useMutation({ mutationFn: (data: { type: CodebookType; name: string; isOfficial?: boolean }) => apiFetch<Response<CodebookItem>>("/api/codebooks", { method: "POST", body: JSON.stringify({ ...data, isOfficial: data.isOfficial ?? true }) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["codebooks"] }), meta: { successMessage: "Stavka je dodana" } });
}

export function useUpdateCodebook() {
  return useMutation({ mutationFn: ({ id, ...data }: { id: string; name?: string; isOfficial?: boolean }) => apiFetch<Response<CodebookItem>>(`/api/codebooks/${id}`, { method: "PUT", body: JSON.stringify(data) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["codebooks"] }), meta: { successMessage: "Stavka je ažurirana" } });
}

export function useDeleteCodebook() {
  return useMutation({ mutationFn: (id: string) => apiFetch<void>(`/api/codebooks/${id}`, { method: "DELETE" }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["codebooks"] }), meta: { successMessage: "Stavka je uklonjena" } });
}
