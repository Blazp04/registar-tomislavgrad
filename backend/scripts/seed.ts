import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { auth } from "../src/lib/auth.js";
import { db } from "../src/core/database/db.js";
import { account, user } from "../src/core/database/auth-schema.js";
import { codebook, type CodebookType } from "../src/core/database/codebook-schema.js";
import { consent, scholarship, studentEducation, studentProfile } from "../src/core/database/student-schema.js";
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from "../src/core/config/policies.js";
import { getCurrentAcademicYear } from "../src/core/utils/profileCompletion.js";

const TEST_STUDENT = {
  email: "student.test@tomislavgrad.local",
  password: "TestniStudent2026!",
  firstName: "Ivana",
  lastName: "Matić",
};

const TEST_ADMIN = {
  email: "admin.test@tomislavgrad.local",
  password: "TestniAdmin2026!",
  firstName: "Administrator",
  lastName: "Registra",
};

const values: Record<CodebookType, string[]> = {
  country: ["Bosna i Hercegovina", "Hrvatska", "Slovenija", "Srbija", "Crna Gora", "Austrija", "Njemačka"],
  city: ["Tomislavgrad", "Mostar", "Sarajevo", "Split", "Zagreb", "Banja Luka", "Tuzla", "Osijek", "Rijeka"],
  municipality_settlement: [
    "Tomislavgrad", "Bukovica", "Cebara", "Crvenice", "Ćavarov Stan", "Dobrići", "Eminovo Selo", "Galečić",
    "Grabovica", "Jošanica", "Kolo", "Kongora", "Korita", "Kovači", "Krnjin", "Kuk", "Letka", "Lipa", "Lug",
    "Mandino Selo", "Mesihovina", "Mokronoge", "Mrkodol", "Omerovići", "Omolje", "Oplećani", "Prisoje", "Radoši",
    "Rašćani", "Roško Polje", "Sarajlije", "Seonica", "Srđani", "Stipanići", "Šujica", "Vinica", "Vojkovići", "Zaljiće", "Zidine",
  ],
  high_school: ["Gimnazija Marka Marulića Tomislavgrad", "Srednja strukovna škola Tomislavgrad"],
  university: ["Sveučilište u Mostaru", "Univerzitet u Sarajevu", "Sveučilište u Splitu", "Sveučilište u Zagrebu", "Univerzitet u Banjoj Luci"],
  faculty: [
    "Fakultet strojarstva, računarstva i elektrotehnike Sveučilišta u Mostaru",
    "Filozofski fakultet Sveučilišta u Mostaru",
    "Pravni fakultet Sveučilišta u Mostaru",
    "Ekonomski fakultet Sveučilišta u Mostaru",
  ],
  study_program: ["Računarstvo", "Strojarstvo", "Hrvatski jezik i književnost", "Pravo", "Ekonomija"],
  study_level: ["Preddiplomski studij", "Diplomski studij", "Integrirani studij", "Stručni studij", "Poslijediplomski studij"],
  scholarship_type: ["Općinska stipendija", "Županijska stipendija", "Državna stipendija", "Privatna stipendija"],
  scholarship_provider: ["Općina Tomislavgrad", "Hercegbosanska županija", "Federalno ministarstvo obrazovanja i znanosti"],
};

for (const [type, names] of Object.entries(values) as Array<[CodebookType, string[]]>) {
  await db.insert(codebook).values(names.map((name) => ({ type, name, isOfficial: true }))).onConflictDoNothing();
}

async function codebookId(type: CodebookType, name: string) {
  const [item] = await db
    .select({ id: codebook.id })
    .from(codebook)
    .where(and(eq(codebook.type, type), eq(codebook.name, name)))
    .limit(1);
  if (!item) throw new Error(`Nedostaje šifrarnik ${type}: ${name}`);
  return item.id;
}

let [testUser] = await db.select().from(user).where(eq(user.email, TEST_STUDENT.email)).limit(1);

if (!testUser) {
  const signUpBody = {
    email: TEST_STUDENT.email,
    password: TEST_STUDENT.password,
    name: `${TEST_STUDENT.firstName} ${TEST_STUDENT.lastName}`,
    firstName: TEST_STUDENT.firstName,
    lastName: TEST_STUDENT.lastName,
    termsAccepted: true,
    privacyAccepted: true,
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_POLICY_VERSION,
  } satisfies NonNullable<Parameters<typeof auth.api.signUpEmail>[0]>["body"] & {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    termsVersion: string;
    privacyVersion: string;
  };

  const result = await auth.api.signUpEmail({ body: signUpBody });
  [testUser] = await db
    .update(user)
    .set({ emailVerified: true })
    .where(eq(user.id, result.user.id))
    .returning();
}

if (!testUser) throw new Error("Testni korisnik nije kreiran.");

await db.update(account)
  .set({ password: await hashPassword(TEST_STUDENT.password), updatedAt: new Date() })
  .where(and(eq(account.userId, testUser.id), eq(account.providerId, "credential")));

let [testAdmin] = await db.select().from(user).where(eq(user.email, TEST_ADMIN.email)).limit(1);

if (!testAdmin) {
  const signUpBody = {
    email: TEST_ADMIN.email,
    password: TEST_ADMIN.password,
    name: `${TEST_ADMIN.firstName} ${TEST_ADMIN.lastName}`,
    firstName: TEST_ADMIN.firstName,
    lastName: TEST_ADMIN.lastName,
    termsAccepted: true,
    privacyAccepted: true,
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_POLICY_VERSION,
  } satisfies NonNullable<Parameters<typeof auth.api.signUpEmail>[0]>["body"] & {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    termsVersion: string;
    privacyVersion: string;
  };

  const result = await auth.api.signUpEmail({ body: signUpBody });
  [testAdmin] = await db.select().from(user).where(eq(user.id, result.user.id)).limit(1);
}

if (!testAdmin) throw new Error("Testni administrator nije kreiran.");

await db.update(user).set({
  name: `${TEST_ADMIN.firstName} ${TEST_ADMIN.lastName}`,
  firstName: TEST_ADMIN.firstName,
  lastName: TEST_ADMIN.lastName,
  role: "admin",
  emailVerified: true,
  isActive: true,
  updatedAt: new Date(),
}).where(eq(user.id, testAdmin.id));

await db.update(account)
  .set({ password: await hashPassword(TEST_ADMIN.password), updatedAt: new Date() })
  .where(and(eq(account.userId, testAdmin.id), eq(account.providerId, "credential")));

await db.delete(studentProfile).where(eq(studentProfile.userId, testAdmin.id));
await db.delete(consent).where(eq(consent.userId, testAdmin.id));

const [profile] = await db
  .insert(studentProfile)
  .values({ userId: testUser.id })
  .onConflictDoNothing()
  .returning();
const existingProfile = profile ?? (await db.select().from(studentProfile).where(eq(studentProfile.userId, testUser.id)).limit(1))[0];
if (!existingProfile) throw new Error("Testni studentski profil nije kreiran.");

const [
  settlementId,
  countryId,
  tomislavgradId,
  mostarId,
  highSchoolId,
  universityId,
  facultyId,
  studyProgramId,
  studyLevelId,
  municipalScholarshipTypeId,
  countyScholarshipTypeId,
  municipalProviderId,
  countyProviderId,
] = await Promise.all([
  codebookId("municipality_settlement", "Tomislavgrad"),
  codebookId("country", "Bosna i Hercegovina"),
  codebookId("city", "Tomislavgrad"),
  codebookId("city", "Mostar"),
  codebookId("high_school", "Gimnazija Marka Marulića Tomislavgrad"),
  codebookId("university", "Sveučilište u Mostaru"),
  codebookId("faculty", "Fakultet strojarstva, računarstva i elektrotehnike Sveučilišta u Mostaru"),
  codebookId("study_program", "Računarstvo"),
  codebookId("study_level", "Preddiplomski studij"),
  codebookId("scholarship_type", "Općinska stipendija"),
  codebookId("scholarship_type", "Županijska stipendija"),
  codebookId("scholarship_provider", "Općina Tomislavgrad"),
  codebookId("scholarship_provider", "Hercegbosanska županija"),
]);

await db.update(studentProfile).set({
  birthDate: "2005-04-18",
  address: "Ulica kralja Zvonimira 12",
  settlementId,
  phone: "+387 63 123 456",
  completionPercentage: 100,
  verifiedAcademicYear: null,
  verifiedAt: null,
  updatedAt: new Date(),
}).where(eq(studentProfile.id, existingProfile.id));

const [existingHighSchool] = await db.select({ id: studentEducation.id }).from(studentEducation).where(and(
  eq(studentEducation.profileId, existingProfile.id),
  eq(studentEducation.type, "high_school"),
)).limit(1);
const highSchoolData = {
  profileId: existingProfile.id,
  type: "high_school" as const,
  cityId: tomislavgradId,
  highSchoolId,
  highSchoolProgram: "Opća gimnazija",
  graduationYear: 2024,
  isCurrent: false,
};
if (existingHighSchool) {
  await db.update(studentEducation).set({ ...highSchoolData, updatedAt: new Date() }).where(eq(studentEducation.id, existingHighSchool.id));
} else {
  await db.insert(studentEducation).values(highSchoolData);
}

const [existingStudy] = await db.select({ id: studentEducation.id }).from(studentEducation).where(and(
  eq(studentEducation.profileId, existingProfile.id),
  eq(studentEducation.type, "higher_education"),
  eq(studentEducation.isCurrent, true),
)).limit(1);
const studyData = {
  profileId: existingProfile.id,
  type: "higher_education" as const,
  countryId,
  cityId: mostarId,
  universityId,
  facultyId,
  studyProgramId,
  studyLevelId,
  studyMode: "full_time" as const,
  firstEnrollmentYear: 2024,
  currentStudyYear: 3,
  expectedGraduationYear: 2027,
  studyStatus: "active" as const,
  isCurrent: true,
};
if (existingStudy) {
  await db.update(studentEducation).set({ ...studyData, updatedAt: new Date() }).where(eq(studentEducation.id, existingStudy.id));
} else {
  await db.insert(studentEducation).values(studyData);
}

for (const type of [
  { type: "terms" as const, version: TERMS_VERSION },
  { type: "privacy" as const, version: PRIVACY_POLICY_VERSION },
]) {
  const [existingConsent] = await db.select({ id: consent.id }).from(consent).where(and(
    eq(consent.userId, testUser.id),
    eq(consent.type, type.type),
    eq(consent.version, type.version),
  )).limit(1);
  if (!existingConsent) await db.insert(consent).values({ userId: testUser.id, ...type, accepted: true });
}

const currentAcademicYear = getCurrentAcademicYear();
const currentAcademicYearStart = Number(currentAcademicYear.slice(0, 4));
const scholarshipFixtures = [
  {
    name: null,
    scholarshipTypeId: municipalScholarshipTypeId,
    providerId: municipalProviderId,
    academicYear: currentAcademicYear,
    status: "active" as const,
    startDate: `${currentAcademicYearStart}-10-01`,
    endDate: `${currentAcademicYearStart + 1}-06-30`,
    amount: "150.00",
    currency: "BAM",
    adminNote: "Testni zapis za provjeru studentskog pregleda stipendija.",
  },
  {
    name: null,
    scholarshipTypeId: countyScholarshipTypeId,
    providerId: countyProviderId,
    academicYear: `${currentAcademicYearStart - 1}/${currentAcademicYearStart}`,
    status: "completed" as const,
    startDate: `${currentAcademicYearStart - 1}-10-01`,
    endDate: `${currentAcademicYearStart}-06-30`,
    amount: "120.00",
    currency: "BAM",
    adminNote: "Prethodna stipendija, unesena kao testni podatak.",
  },
];

for (const fixture of scholarshipFixtures) {
  const [existingScholarship] = await db.select({ id: scholarship.id }).from(scholarship).where(and(
    eq(scholarship.profileId, existingProfile.id),
    eq(scholarship.scholarshipTypeId, fixture.scholarshipTypeId),
    eq(scholarship.academicYear, fixture.academicYear),
  )).limit(1);
  if (existingScholarship) {
    await db.update(scholarship).set({ ...fixture, updatedAt: new Date() }).where(eq(scholarship.id, existingScholarship.id));
  } else {
    await db.insert(scholarship).values({ profileId: existingProfile.id, ...fixture });
  }
}

console.log("Početni šifrarnici i testni korisnički podaci su uneseni.");
console.log(`Testna studentska prijava: ${TEST_STUDENT.email} / ${TEST_STUDENT.password}`);
console.log(`Testna administratorska prijava: ${TEST_ADMIN.email} / ${TEST_ADMIN.password}`);
process.exit(0);
