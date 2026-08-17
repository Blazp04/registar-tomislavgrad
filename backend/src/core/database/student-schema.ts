import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { codebook } from "./codebook-schema.js";

export const educationTypeEnum = pgEnum("education_type", ["high_school", "higher_education"]);
export const studyModeEnum = pgEnum("study_mode", ["full_time", "part_time", "distance", "other"]);
export const studyStatusEnum = pgEnum("study_status", ["active", "paused", "completed", "withdrawn"]);
export const scholarshipStatusEnum = pgEnum("scholarship_status", ["recorded", "active", "completed", "suspended", "rejected"]);
export const consentTypeEnum = pgEnum("consent_type", ["terms", "privacy", "optional_updates"]);
export const dataRequestTypeEnum = pgEnum("data_request_type", ["correction", "export", "restriction", "deletion"]);
export const dataRequestStatusEnum = pgEnum("data_request_status", ["submitted", "in_review", "completed", "rejected"]);

export const studentProfile = pgTable("student_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  birthDate: date("birth_date", { mode: "string" }),
  address: text("address"),
  settlementId: text("settlement_id").references(() => codebook.id, { onDelete: "restrict" }),
  phone: text("phone"),
  completionPercentage: integer("completion_percentage").default(0).notNull(),
  verifiedAcademicYear: text("verified_academic_year"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("student_profiles_user_id_uq").on(table.userId),
  index("student_profiles_updated_at_idx").on(table.updatedAt),
  index("student_profiles_verified_year_idx").on(table.verifiedAcademicYear),
]);

export const studentEducation = pgTable("student_educations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().references(() => studentProfile.id, { onDelete: "cascade" }),
  type: educationTypeEnum("type").notNull(),
  countryId: text("country_id").references(() => codebook.id, { onDelete: "restrict" }),
  cityId: text("city_id").references(() => codebook.id, { onDelete: "restrict" }),
  highSchoolId: text("high_school_id").references(() => codebook.id, { onDelete: "restrict" }),
  highSchoolProgram: text("high_school_program"),
  graduationYear: integer("graduation_year"),
  universityId: text("university_id").references(() => codebook.id, { onDelete: "restrict" }),
  facultyId: text("faculty_id").references(() => codebook.id, { onDelete: "restrict" }),
  studyProgramId: text("study_program_id").references(() => codebook.id, { onDelete: "restrict" }),
  studyLevelId: text("study_level_id").references(() => codebook.id, { onDelete: "restrict" }),
  studyMode: studyModeEnum("study_mode"),
  firstEnrollmentYear: integer("first_enrollment_year"),
  currentStudyYear: integer("current_study_year"),
  expectedGraduationYear: integer("expected_graduation_year"),
  studyStatus: studyStatusEnum("study_status"),
  isCurrent: boolean("is_current").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("student_educations_profile_id_idx").on(table.profileId),
  index("student_educations_type_idx").on(table.type),
  index("student_educations_current_idx").on(table.isCurrent),
  index("student_educations_city_idx").on(table.cityId),
  index("student_educations_faculty_idx").on(table.facultyId),
  index("student_educations_program_idx").on(table.studyProgramId),
  index("student_educations_status_idx").on(table.studyStatus),
]);

export const scholarship = pgTable("scholarships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().references(() => studentProfile.id, { onDelete: "cascade" }),
  name: text("name"),
  scholarshipTypeId: text("scholarship_type_id").references(() => codebook.id, { onDelete: "restrict" }),
  providerId: text("provider_id").notNull().references(() => codebook.id, { onDelete: "restrict" }),
  academicYear: text("academic_year").notNull(),
  status: scholarshipStatusEnum("status").default("recorded").notNull(),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  currency: text("currency").default("BAM").notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
}, (table) => [
  index("scholarships_profile_id_idx").on(table.profileId),
  index("scholarships_academic_year_idx").on(table.academicYear),
  index("scholarships_status_idx").on(table.status),
  index("scholarships_type_idx").on(table.scholarshipTypeId),
]);

export const consent = pgTable("consents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: consentTypeEnum("type").notNull(),
  version: text("version").notNull(),
  accepted: boolean("accepted").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).defaultNow().notNull(),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
  ipAddress: text("ip_address"),
}, (table) => [
  index("consents_user_id_idx").on(table.userId),
  index("consents_type_idx").on(table.type),
]);

export const dataRequest = pgTable("data_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  requesterEmail: text("requester_email").notNull(),
  type: dataRequestTypeEnum("type").notNull(),
  status: dataRequestStatusEnum("status").default("submitted").notNull(),
  details: text("details"),
  resolutionNote: text("resolution_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: text("resolved_by").references(() => user.id, { onDelete: "set null" }),
}, (table) => [
  index("data_requests_user_id_idx").on(table.userId),
  index("data_requests_status_idx").on(table.status),
  index("data_requests_created_at_idx").on(table.createdAt),
]);

export const auditLog = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  subjectUserId: text("subject_user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_logs_actor_id_idx").on(table.actorId),
  index("audit_logs_subject_user_id_idx").on(table.subjectUserId),
  index("audit_logs_created_at_idx").on(table.createdAt),
  index("audit_logs_entity_idx").on(table.entityType, table.entityId),
]);

export const studentProfileRelations = relations(studentProfile, ({ one, many }) => ({
  user: one(user, { fields: [studentProfile.userId], references: [user.id] }),
  settlement: one(codebook, { fields: [studentProfile.settlementId], references: [codebook.id], relationName: "profileSettlement" }),
  educations: many(studentEducation),
  scholarships: many(scholarship),
}));

export const studentEducationRelations = relations(studentEducation, ({ one }) => ({
  profile: one(studentProfile, { fields: [studentEducation.profileId], references: [studentProfile.id] }),
}));

export const scholarshipRelations = relations(scholarship, ({ one }) => ({
  profile: one(studentProfile, { fields: [scholarship.profileId], references: [studentProfile.id] }),
}));
