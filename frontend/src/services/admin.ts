import { useMutation, useQuery } from "@tanstack/react-query";
import { apiDownload, apiFetch, queryClient } from "./apiClient";
import type { DataRequest, EducationInput, Profile, ProfileBundle, Scholarship, ScholarshipStatus, StudyStatus } from "./registry";

type ApiResponse<T> = { success: true; data: T; meta?: PaginationMeta };
export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }

export interface StudentListItem {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  completionPercentage: number;
  verifiedAcademicYear: string | null;
  updatedAt: string;
  cityName: string | null;
  facultyName: string | null;
  studyProgramName: string | null;
  currentStudyYear: number | null;
  studyStatus: StudyStatus | null;
  scholarshipCount: number;
}

export interface StudentFilters {
  search?: string;
  academicYear?: string;
  cityId?: string;
  facultyId?: string;
  studyProgramId?: string;
  currentStudyYear?: string;
  studyStatus?: StudyStatus;
  scholarshipTypeId?: string;
  scholarshipStatus?: ScholarshipStatus;
  updatedBefore?: string;
  updatedAfter?: string;
  verification?: "verified" | "unverified";
  page?: string;
  limit?: string;
  sort?: "lastName" | "firstName" | "updatedAt" | "completionPercentage";
  order?: "asc" | "desc";
}

function queryString(filters: object) {
  const params = new URLSearchParams();
  Object.entries(filters as Record<string, string | undefined>).forEach(([key, value]) => { if (value) params.set(key, value); });
  return params.toString();
}

export function useAdminStudents(filters: StudentFilters) {
  const query = queryString(filters);
  return useQuery({
    queryKey: ["admin-students", filters],
    queryFn: () => apiFetch<ApiResponse<StudentListItem[]>>(`/api/admin/students${query ? `?${query}` : ""}`).then((r) => ({ items: r.data, meta: r.meta! })),
  });
}

export function exportAdminStudents(filters: StudentFilters) {
  const query = queryString(filters);
  return apiDownload(`/api/admin/students/export${query ? `?${query}` : ""}`, `studenti-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function useAdminStudent(profileId: string) {
  return useQuery({ queryKey: ["admin-student", profileId], queryFn: () => apiFetch<ApiResponse<ProfileBundle>>(`/api/admin/students/${profileId}`).then((r) => r.data), enabled: Boolean(profileId) });
}

export interface AdminStats {
  total: number;
  active: number;
  completed: number;
  unverified: number;
  stale: number;
  byCity: Array<{ name: string; count: number }>;
  byFaculty: Array<{ name: string; count: number }>;
  byProgram: Array<{ name: string; count: number }>;
  byStudyYear: Array<{ name: number | null; count: number }>;
  scholarshipByYear: Array<{ name: string; count: number }>;
  scholarshipByType: Array<{ name: string; count: number }>;
  scholarshipByStatus: Array<{ name: ScholarshipStatus; count: number }>;
}

export function useAdminStats() {
  return useQuery({ queryKey: ["admin-stats"], queryFn: () => apiFetch<ApiResponse<AdminStats>>("/api/admin/students/stats").then((r) => r.data) });
}

const refreshStudent = (profileId: string) => {
  queryClient.invalidateQueries({ queryKey: ["admin-student", profileId] });
  queryClient.invalidateQueries({ queryKey: ["admin-students"] });
  queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
};

export function useVerifyStudent(profileId: string) {
  return useMutation({ mutationFn: (academicYear: string) => apiFetch(`/api/admin/students/${profileId}/verify`, { method: "POST", body: JSON.stringify({ academicYear }) }), onSuccess: () => refreshStudent(profileId), meta: { successMessage: "Profil je potvrđen" } });
}

export function useUpdateAccountStatus(profileId: string) {
  return useMutation({ mutationFn: (isActive: boolean) => apiFetch(`/api/admin/students/${profileId}/account-status`, { method: "PUT", body: JSON.stringify({ isActive }) }), onSuccess: () => refreshStudent(profileId), meta: { successMessage: "Status računa je ažuriran" } });
}

export interface ScholarshipInput {
  name?: string | null;
  scholarshipTypeId?: string | null;
  providerId: string;
  academicYear: string;
  status: ScholarshipStatus;
  startDate?: string | null;
  endDate?: string | null;
  amount?: number | null;
  currency: string;
  adminNote?: string | null;
}

export function useSaveScholarship(profileId: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: ScholarshipInput }) => apiFetch<ApiResponse<Scholarship>>(id ? `/api/admin/scholarships/${id}` : `/api/admin/students/${profileId}/scholarships`, { method: id ? "PUT" : "POST", body: JSON.stringify(data) }),
    onSuccess: () => refreshStudent(profileId),
    meta: { successMessage: "Stipendija je spremljena" },
  });
}

export function useDeleteScholarship(profileId: string) {
  return useMutation({ mutationFn: (id: string) => apiFetch<void>(`/api/admin/scholarships/${id}`, { method: "DELETE" }), onSuccess: () => refreshStudent(profileId), meta: { successMessage: "Stipendija je uklonjena" } });
}

export function useAdminUpdateProfile(profileId: string) {
  return useMutation({ mutationFn: (data: Partial<Pick<Profile, "firstName" | "lastName" | "birthDate" | "address" | "settlementId" | "phone">>) => apiFetch(`/api/admin/students/${profileId}/profile`, { method: "PUT", body: JSON.stringify(data) }), onSuccess: () => refreshStudent(profileId), meta: { successMessage: "Profil je ažuriran" } });
}

export function useAdminSaveEducation(profileId: string) {
  return useMutation({ mutationFn: ({ id, data }: { id?: string; data: EducationInput }) => apiFetch(id ? `/api/admin/students/${profileId}/educations/${id}` : `/api/admin/students/${profileId}/educations`, { method: id ? "PUT" : "POST", body: JSON.stringify(data) }), onSuccess: () => refreshStudent(profileId), meta: { successMessage: "Obrazovanje je ažurirano" } });
}

export function useAdminDeleteEducation(profileId: string) {
  return useMutation({ mutationFn: (id: string) => apiFetch<void>(`/api/admin/students/${profileId}/educations/${id}`, { method: "DELETE" }), onSuccess: () => refreshStudent(profileId), meta: { successMessage: "Zapis obrazovanja je uklonjen" } });
}

export function useDataRequests(status?: DataRequest["status"]) {
  return useQuery({ queryKey: ["data-requests", status], queryFn: () => apiFetch<ApiResponse<DataRequest[]>>(`/api/admin/data-requests${status ? `?status=${status}` : ""}`).then((r) => r.data) });
}

export function useResolveDataRequest() {
  return useMutation({ mutationFn: ({ id, status, resolutionNote }: { id: string; status: "in_review" | "completed" | "rejected"; resolutionNote?: string }) => apiFetch(`/api/admin/data-requests/${id}`, { method: "PUT", body: JSON.stringify({ status, resolutionNote }) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["data-requests"] }), meta: { successMessage: "Zahtjev je ažuriran" } });
}

export interface AuditLog { id: string; actorName: string | null; action: string; entityType: string; entityId: string | null; createdAt: string }
export function useAuditLogs(page = 1, subjectUserId?: string) {
  const subject = subjectUserId ? `&subjectUserId=${encodeURIComponent(subjectUserId)}` : "";
  return useQuery({ queryKey: ["audit-logs", page, subjectUserId], queryFn: () => apiFetch<ApiResponse<AuditLog[]>>(`/api/admin/audit-logs?page=${page}&limit=30${subject}`).then((r) => ({ items: r.data, meta: r.meta! })) });
}
