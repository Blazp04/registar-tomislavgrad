import { pgTable, text, timestamp, boolean, index, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema.js";
import { codebook } from "./codebook-schema.js";

export const highSchoolTypeEnum = pgEnum("high_school_type", [
  "gimnazija",
  "strukovna",
]);

export const highSchoolDurationEnum = pgEnum("high_school_duration", [
  "trogodisnja",
  "cetverogodisnja",
  "petogodisnja",
]);

export const student = pgTable("student", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fatherName: text("father_name").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),

  // Status: currently a student or not
  isCurrentStudent: boolean("is_current_student").notNull().default(true),

  // Employment
  isEmployed: boolean("is_employed").notNull().default(false),
  isWorkingInField: boolean("is_working_in_field").default(false),

  // High school education
  highSchoolType: highSchoolTypeEnum("high_school_type").notNull(),
  highSchoolDuration: highSchoolDurationEnum("high_school_duration").notNull(),
  highSchoolProfessionId: text("high_school_profession_id")
    .references(() => codebook.id, { onDelete: "restrict" }),
  highSchoolCityId: text("high_school_city_id").notNull()
    .references(() => codebook.id, { onDelete: "restrict" }),

  // Codebook references
  facultyId: text("faculty_id").notNull()
    .references(() => codebook.id, { onDelete: "restrict" }),
  fieldOfStudyId: text("field_of_study_id").notNull()
    .references(() => codebook.id, { onDelete: "restrict" }),
  facultyCityId: text("faculty_city_id").notNull()
    .references(() => codebook.id, { onDelete: "restrict" }),

  // Audit columns
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: text("created_by")
    .references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  updatedBy: text("updated_by")
    .references(() => user.id, { onDelete: "set null" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by")
    .references(() => user.id, { onDelete: "set null" }),
}, (table) => [
  index("student_high_school_profession_id_idx").on(table.highSchoolProfessionId),
  index("student_high_school_city_id_idx").on(table.highSchoolCityId),
  index("student_faculty_id_idx").on(table.facultyId),
  index("student_field_of_study_id_idx").on(table.fieldOfStudyId),
  index("student_faculty_city_id_idx").on(table.facultyCityId),
  index("student_is_current_student_idx").on(table.isCurrentStudent),
  index("student_is_employed_idx").on(table.isEmployed),
  index("student_deleted_at_idx").on(table.deletedAt),
  index("student_last_name_idx").on(table.lastName),
]);

export const studentRelations = relations(student, ({ one }) => ({
  highSchoolProfession: one(codebook, {
    fields: [student.highSchoolProfessionId],
    references: [codebook.id],
    relationName: "studentHighSchoolProfession",
  }),
  highSchoolCity: one(codebook, {
    fields: [student.highSchoolCityId],
    references: [codebook.id],
    relationName: "studentHighSchoolCity",
  }),
  faculty: one(codebook, {
    fields: [student.facultyId],
    references: [codebook.id],
    relationName: "studentFaculty",
  }),
  fieldOfStudy: one(codebook, {
    fields: [student.fieldOfStudyId],
    references: [codebook.id],
    relationName: "studentFieldOfStudy",
  }),
  facultyCity: one(codebook, {
    fields: [student.facultyCityId],
    references: [codebook.id],
    relationName: "studentFacultyCity",
  }),
}));
