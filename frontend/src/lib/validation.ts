import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().min(1, "Ime je obavezno").max(100, "Ime može imati najviše 100 znakova"),
  lastName: z.string().min(1, "Prezime je obavezno").max(100, "Prezime može imati najviše 100 znakova"),
  fatherName: z.string().min(1, "Ime oca je obavezno").max(100, "Ime oca može imati najviše 100 znakova"),
  email: z.string().min(1, "Email je obavezan").email("Unesite ispravan email"),
  address: z.string().min(1, "Adresa je obavezna").max(255, "Adresa može imati najviše 255 znakova"),
  phone: z.string().min(6, "Broj telefona mora imati najmanje 6 znakova").max(30, "Broj telefona može imati najviše 30 znakova"),
  isCurrentStudent: z.boolean(),
  isEmployed: z.boolean(),
  isWorkingInField: z.boolean().optional().default(false),
  highSchoolType: z.enum(["gimnazija", "strukovna"], { message: "Odaberite vrstu srednje škole" }),
  highSchoolDuration: z.enum(["trogodisnja", "cetverogodisnja", "petogodisnja"], { message: "Odaberite trajanje" }),
  highSchoolProfessionId: z.string().uuid().optional(),
  highSchoolCityId: z.string().min(1, "Grad srednje škole je obavezan"),
  customHighSchoolProfessionName: z.string().min(2, "Unesite naziv struke (min 2 znaka)").max(255).optional(),
  customCityName: z.string().min(2, "Unesite naziv grada (min 2 znaka)").max(255).optional(),
  facultyId: z.string().min(1, "Odaberite fakultet"),
  fieldOfStudyId: z.string().min(1, "Odaberite smjer"),
  facultyCityId: z.string().min(1, "Odaberite grad fakulteta"),
  customFacultyName: z.string().min(2, "Unesite naziv fakulteta (min 2 znaka)").max(255).optional(),
  customFieldOfStudyName: z.string().min(2, "Unesite naziv smjera (min 2 znaka)").max(255).optional(),
}).refine((data) => {
  if (data.highSchoolType === "gimnazija") return true;
  return !!data.highSchoolProfessionId || !!data.customHighSchoolProfessionName;
}, {
  message: "Struka je obavezna za strukovnu školu",
  path: ["highSchoolProfessionId"],
});

export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
