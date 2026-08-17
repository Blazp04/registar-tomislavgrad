import { z } from "zod";

const currentYear = new Date().getFullYear();
const year = z.coerce.number().int().min(1950).max(currentYear + 15);
const nullableCodebookId = z.string().uuid().nullable().optional();
const academicYear = z.string().regex(/^\d{4}\/\d{4}$/, "Akademska godina mora biti u obliku 2026/2027");

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  birthDate: z.string().date().nullable().optional(),
  address: z.string().trim().max(255).nullable().optional(),
  settlementId: nullableCodebookId,
  phone: z.string().trim().min(6).max(30).nullable().optional(),
});

export const educationSchema = z.object({
  type: z.enum(["high_school", "higher_education"]),
  countryId: nullableCodebookId,
  cityId: nullableCodebookId,
  highSchoolId: nullableCodebookId,
  highSchoolProgram: z.string().trim().max(255).nullable().optional(),
  graduationYear: year.nullable().optional(),
  universityId: nullableCodebookId,
  facultyId: nullableCodebookId,
  studyProgramId: nullableCodebookId,
  studyLevelId: nullableCodebookId,
  studyMode: z.enum(["full_time", "part_time", "distance", "other"]).nullable().optional(),
  firstEnrollmentYear: year.nullable().optional(),
  currentStudyYear: z.coerce.number().int().min(1).max(10).nullable().optional(),
  expectedGraduationYear: year.nullable().optional(),
  studyStatus: z.enum(["active", "paused", "completed", "withdrawn"]).nullable().optional(),
  isCurrent: z.boolean().default(false),
}).superRefine((value, ctx) => {
  const required = value.type === "high_school"
    ? ["cityId", "highSchoolId", "highSchoolProgram", "graduationYear"] as const
    : ["countryId", "cityId", "universityId", "facultyId", "studyProgramId", "studyLevelId", "studyMode", "firstEnrollmentYear", "currentStudyYear", "expectedGraduationYear", "studyStatus"] as const;

  for (const field of required) {
    if (value[field] === null || value[field] === undefined || value[field] === "") {
      ctx.addIssue({ code: "custom", path: [field], message: "Polje je obavezno" });
    }
  }
});

export const scholarshipSchema = z.object({
  name: z.string().trim().max(255).nullable().optional(),
  scholarshipTypeId: nullableCodebookId,
  providerId: z.string().uuid(),
  academicYear,
  status: z.enum(["recorded", "active", "completed", "suspended", "rejected"]),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
  amount: z.coerce.number().nonnegative().max(1_000_000).nullable().optional(),
  currency: z.string().trim().length(3).default("BAM"),
  adminNote: z.string().trim().max(2000).nullable().optional(),
}).refine((value) => value.name || value.scholarshipTypeId, {
  path: ["name"],
  message: "Unesite naziv ili odaberite vrstu stipendije",
}).refine((value) => !value.startDate || !value.endDate || value.startDate <= value.endDate, {
  path: ["endDate"],
  message: "Datum završetka mora biti nakon datuma početka",
});

export const studentQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  academicYear: academicYear.optional(),
  cityId: z.string().uuid().optional(),
  facultyId: z.string().uuid().optional(),
  studyProgramId: z.string().uuid().optional(),
  currentStudyYear: z.coerce.number().int().min(1).max(10).optional(),
  studyStatus: z.enum(["active", "paused", "completed", "withdrawn"]).optional(),
  scholarshipTypeId: z.string().uuid().optional(),
  scholarshipStatus: z.enum(["recorded", "active", "completed", "suspended", "rejected"]).optional(),
  updatedBefore: z.string().datetime({ offset: true }).optional(),
  updatedAfter: z.string().datetime({ offset: true }).optional(),
  verification: z.enum(["verified", "unverified"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["lastName", "firstName", "updatedAt", "completionPercentage"]).default("lastName"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const profileVerificationSchema = z.object({
  academicYear,
});

export const dataRequestSchema = z.object({
  type: z.enum(["correction", "export", "restriction", "deletion"]),
  details: z.string().trim().max(2000).nullable().optional(),
});

export const dataRequestResolutionSchema = z.object({
  status: z.enum(["in_review", "completed", "rejected"]),
  resolutionNote: z.string().trim().max(2000).nullable().optional(),
});

export const consentSchema = z.object({
  type: z.literal("optional_updates"),
  accepted: z.boolean(),
  version: z.string().trim().min(1).max(50),
});

export const accountStatusSchema = z.object({ isActive: z.boolean() });

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
export type EducationDTO = z.infer<typeof educationSchema>;
export type ScholarshipDTO = z.infer<typeof scholarshipSchema>;
export type StudentQueryDTO = z.infer<typeof studentQuerySchema>;
export type DataRequestDTO = z.infer<typeof dataRequestSchema>;
export type DataRequestResolutionDTO = z.infer<typeof dataRequestResolutionSchema>;
export type ConsentDTO = z.infer<typeof consentSchema>;
