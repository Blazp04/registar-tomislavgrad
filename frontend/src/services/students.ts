import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch, queryClient } from "./apiClient";
import type { paths } from "@/types/api";

type StudentItem = NonNullable<
  paths["/api/students"]["get"]["responses"]["200"]["content"]["application/json"]["data"]
>[number];

type StudentStats = NonNullable<
  paths["/api/students/stats"]["get"]["responses"]["200"]["content"]["application/json"]["data"]
>;

type PaginationMeta = NonNullable<
  paths["/api/students"]["get"]["responses"]["200"]["content"]["application/json"]["meta"]
>;

type CreateStudentBody =
  paths["/api/students"]["post"]["requestBody"]["content"]["application/json"];

type UpdateStudentBody =
  paths["/api/students/{id}"]["put"]["requestBody"]["content"]["application/json"];

type SendSmsBody =
  paths["/api/students/sms"]["post"]["requestBody"]["content"]["application/json"];

type SendEmailBody =
  paths["/api/students/email"]["post"]["requestBody"]["content"]["application/json"];

type SmsResponse = NonNullable<
  paths["/api/students/sms"]["post"]["responses"]["200"]["content"]["application/json"]["data"]
>;

type EmailResponse = NonNullable<
  paths["/api/students/email"]["post"]["responses"]["200"]["content"]["application/json"]["data"]
>;

export interface StudentFilters {
  search?: string;
  facultyId?: string;
  fieldOfStudyId?: string;
  isCurrentStudent?: "true" | "false";
  isEmployed?: "true" | "false";
  isWorkingInField?: "true" | "false";
  page?: string;
  limit?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export function useStudents(filters: StudentFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  });
  const qs = params.toString();

  return useQuery({
    queryKey: ["students", filters],
    queryFn: () =>
      apiFetch<{ success: boolean; data: StudentItem[]; meta: PaginationMeta }>(
        `/api/students${qs ? `?${qs}` : ""}`
      ).then((r) => ({ items: r.data, meta: r.meta })),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () =>
      apiFetch<{ success: boolean; data: StudentItem }>(
        `/api/students/${id}`
      ).then((r) => r.data),
    enabled: !!id,
  });
}

export function useStudentStats() {
  return useQuery({
    queryKey: ["students", "stats"],
    queryFn: () =>
      apiFetch<{ success: boolean; data: StudentStats }>(
        "/api/students/stats"
      ).then((r) => r.data),
  });
}

export function useCreateStudent() {
  return useMutation({
    mutationFn: (data: CreateStudentBody) =>
      apiFetch<{ success: boolean; data: StudentItem }>("/api/students", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    meta: { successMessage: "Student je uspješno dodan" },
  });
}

export function useUpdateStudent() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentBody }) =>
      apiFetch<{ success: boolean; data: StudentItem }>(`/api/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    meta: { successMessage: "Student je uspješno ažuriran" },
  });
}

export function useDeleteStudent() {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/students/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    meta: { successMessage: "Student je uspješno obrisan" },
  });
}

export function useSendBulkSms() {
  return useMutation({
    mutationFn: (data: SendSmsBody) =>
      apiFetch<{ success: boolean; data: SmsResponse }>("/api/students/sms", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.data),
    meta: { successMessage: "SMS poruke su poslane" },
  });
}

export function useSendBulkEmail() {
  return useMutation({
    mutationFn: (data: SendEmailBody) =>
      apiFetch<{ success: boolean; data: EmailResponse }>("/api/students/email", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.data),
    meta: { successMessage: "Email poruke su poslane" },
  });
}

export type { StudentItem, StudentStats, PaginationMeta, CreateStudentBody, UpdateStudentBody, SendSmsBody, SendEmailBody, SmsResponse, EmailResponse };
