import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fatherName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  address: z.string().min(1).max(255),
  phone: z.string().min(6).max(30),
  isCurrentStudent: z.boolean(),
  isEmployed: z.boolean(),
  isWorkingInField: z.boolean().optional().default(false),
  // High school education
  highSchoolType: z.enum(["gimnazija", "strukovna"]),
  highSchoolDuration: z.enum(["trogodisnja", "cetverogodisnja", "petogodisnja"]),
  highSchoolProfessionId: z.string().uuid().optional(),
  highSchoolCityId: z.string().uuid(),
  customHighSchoolProfessionName: z.string().min(2).max(255).optional(),
  customCityName: z.string().min(2).max(255).optional(),
  // Faculty
  facultyId: z.string().uuid(),
  fieldOfStudyId: z.string().uuid(),
  facultyCityId: z.string().uuid(),
  // "Drugo" option — if provided, auto-creates a codebook entry
  customFacultyName: z.string().min(2).max(255).optional(),
  customFieldOfStudyName: z.string().min(2).max(255).optional(),
}).refine((data) => {
  // Gimnazija is always 4-year
  if (data.highSchoolType === "gimnazija") return true;
  // Strukovna requires profession
  return !!data.highSchoolProfessionId || !!data.customHighSchoolProfessionName;
}, {
  message: "Struka je obavezna za strukovnu školu",
  path: ["highSchoolProfessionId"],
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  fatherName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  address: z.string().min(1).max(255).optional(),
  phone: z.string().min(6).max(30).optional(),
  isCurrentStudent: z.boolean().optional(),
  isEmployed: z.boolean().optional(),
  isWorkingInField: z.boolean().optional(),
  // High school education
  highSchoolType: z.enum(["gimnazija", "strukovna"]).optional(),
  highSchoolDuration: z.enum(["trogodisnja", "cetverogodisnja", "petogodisnja"]).optional(),
  highSchoolProfessionId: z.string().uuid().nullable().optional(),
  highSchoolCityId: z.string().uuid().optional(),
  customHighSchoolProfessionName: z.string().min(2).max(255).optional(),
  customCityName: z.string().min(2).max(255).optional(),
  // Faculty
  facultyId: z.string().uuid().optional(),
  fieldOfStudyId: z.string().uuid().optional(),
  facultyCityId: z.string().uuid().optional(),
  customFacultyName: z.string().min(2).max(255).optional(),
  customFieldOfStudyName: z.string().min(2).max(255).optional(),
});

export const studentQuerySchema = z.object({
  search: z.string().optional(),
  facultyId: z.string().uuid().optional(),
  fieldOfStudyId: z.string().uuid().optional(),
  isCurrentStudent: z.enum(["true", "false"]).optional().transform(v => v === undefined ? undefined : v === "true"),
  isEmployed: z.enum(["true", "false"]).optional().transform(v => v === undefined ? undefined : v === "true"),
  isWorkingInField: z.enum(["true", "false"]).optional().transform(v => v === undefined ? undefined : v === "true"),
  page: z.string().optional().default("1").transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default("20").transform(Number).pipe(z.number().int().positive().max(100)),
  sort: z.enum(["lastName", "firstName", "facultyName", "fieldOfStudyName", "createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const sendSmsSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1).max(500),
  messageTemplate: z.string().min(1).max(1000),
});

export const sendEmailSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1).max(500),
  subject: z.string().min(1, "Naslov je obavezan").max(200),
  messageTemplate: z.string().min(1, "Poruka je obavezna").max(5000),
});

export type CreateStudentDTO = z.infer<typeof createStudentSchema>;
export type UpdateStudentDTO = z.infer<typeof updateStudentSchema>;
export type StudentQueryDTO = z.infer<typeof studentQuerySchema>;
export type SendSmsDTO = z.infer<typeof sendSmsSchema>;
export type SendEmailDTO = z.infer<typeof sendEmailSchema>;
