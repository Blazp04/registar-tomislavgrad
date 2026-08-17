import { useMutation, useQuery } from "@tanstack/react-query";
import { apiDownload, apiFetch, queryClient } from "./apiClient";

export type EducationType = "high_school" | "higher_education";
export type StudyStatus = "active" | "paused" | "completed" | "withdrawn";
export type ScholarshipStatus = "recorded" | "active" | "completed" | "suspended" | "rejected";

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  birthDate: string | null;
  address: string | null;
  settlementId: string | null;
  settlementName: string | null;
  phone: string | null;
  completionPercentage: number;
  verifiedAcademicYear: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  profileId: string;
  type: EducationType;
  countryId: string | null;
  countryName: string | null;
  cityId: string | null;
  cityName: string | null;
  highSchoolId: string | null;
  highSchoolName: string | null;
  highSchoolProgram: string | null;
  graduationYear: number | null;
  universityId: string | null;
  universityName: string | null;
  facultyId: string | null;
  facultyName: string | null;
  studyProgramId: string | null;
  studyProgramName: string | null;
  studyLevelId: string | null;
  studyLevelName: string | null;
  studyMode: "full_time" | "part_time" | "distance" | "other" | null;
  firstEnrollmentYear: number | null;
  currentStudyYear: number | null;
  expectedGraduationYear: number | null;
  studyStatus: StudyStatus | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EducationInput = Omit<Education, "id" | "profileId" | "countryName" | "cityName" | "highSchoolName" | "universityName" | "facultyName" | "studyProgramName" | "studyLevelName" | "createdAt" | "updatedAt">;

export interface Scholarship {
  id: string;
  profileId: string;
  name: string | null;
  scholarshipTypeId: string | null;
  scholarshipTypeName: string | null;
  providerId: string;
  providerName: string | null;
  academicYear: string;
  status: ScholarshipStatus;
  startDate: string | null;
  endDate: string | null;
  amount: string | null;
  currency: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Consent {
  id: string;
  type: "terms" | "privacy" | "optional_updates";
  version: string;
  accepted: boolean;
  acceptedAt: string;
  withdrawnAt: string | null;
}

export interface DataRequest {
  id: string;
  userId: string | null;
  requesterEmail: string;
  type: "correction" | "export" | "restriction" | "deletion";
  status: "submitted" | "in_review" | "completed" | "rejected";
  details: string | null;
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ProfileBundle {
  profile: Profile;
  educations: Education[];
  scholarships: Scholarship[];
  consents: Consent[];
  dataRequests: DataRequest[];
  currentAcademicYear: string;
}

export interface StudentDashboard {
  greetingName: string;
  completionPercentage: number;
  currentStudy: Education | null;
  verifiedAcademicYear: string | null;
  currentAcademicYear: string;
  needsConfirmation: boolean;
  scholarships: Scholarship[];
  lastUpdatedAt: string;
}

type ApiResponse<T> = { success: true; data: T };

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: () => apiFetch<ApiResponse<ProfileBundle>>("/api/profile").then((r) => r.data) });
}

export function useStudentDashboard() {
  return useQuery({ queryKey: ["student-dashboard"], queryFn: () => apiFetch<ApiResponse<StudentDashboard>>("/api/dashboard").then((r) => r.data) });
}

const refreshProfile = () => {
  queryClient.invalidateQueries({ queryKey: ["profile"] });
  queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["session"] });
};

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; birthDate?: string | null; address?: string | null; settlementId?: string | null; phone?: string | null }) => apiFetch<ApiResponse<Profile>>("/api/profile", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: refreshProfile,
    meta: { successMessage: "Osobni podaci su spremljeni" },
  });
}

export function useSaveEducation() {
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: EducationInput }) => apiFetch<ApiResponse<Education>>(id ? `/api/profile/educations/${id}` : "/api/profile/educations", { method: id ? "PUT" : "POST", body: JSON.stringify(data) }),
    onSuccess: refreshProfile,
    meta: { successMessage: "Podaci o obrazovanju su spremljeni" },
  });
}

export function useDeleteEducation() {
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/profile/educations/${id}`, { method: "DELETE" }),
    onSuccess: refreshProfile,
    meta: { successMessage: "Zapis obrazovanja je uklonjen" },
  });
}

export function useConfirmProfile() {
  return useMutation({
    mutationFn: () => apiFetch<ApiResponse<Profile>>("/api/profile/confirm", { method: "POST" }),
    onSuccess: refreshProfile,
    meta: { successMessage: "Podaci su potvrđeni za aktualnu akademsku godinu" },
  });
}

export function useRecordConsent() {
  return useMutation({
    mutationFn: (accepted: boolean) => apiFetch("/api/profile/consents", { method: "POST", body: JSON.stringify({ type: "optional_updates", accepted, version: "2026-08-17" }) }),
    onSuccess: refreshProfile,
    meta: { successMessage: "Postavka privole je spremljena" },
  });
}

export function useCreateDataRequest() {
  return useMutation({
    mutationFn: (data: { type: DataRequest["type"]; details?: string | null }) => apiFetch("/api/profile/data-requests", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: refreshProfile,
    meta: { successMessage: "Zahtjev je zaprimljen" },
  });
}

export function downloadOwnData() {
  return apiDownload("/api/profile/export", `moji-podaci-${new Date().toISOString().slice(0, 10)}.json`);
}

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: () => apiFetch<void>("/api/account/deactivate", { method: "POST" }),
  });
}
