import { pgTable, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { student } from "./student-schema.js";

export const codebookTypeEnum = pgEnum("codebook_type", [
  "faculty",
  "field_of_study",
  "high_school_profession",
  "city",
]);

export const codebook = pgTable("codebook", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  type: codebookTypeEnum("type").notNull(),
  name: text("name").notNull(),

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
  unique("codebook_type_name_uq").on(table.type, table.name),
  index("codebook_type_idx").on(table.type),
  index("codebook_name_idx").on(table.name),
  index("codebook_deleted_at_idx").on(table.deletedAt),
]);

export const codebookRelations = relations(codebook, ({ many }) => ({
  facultyStudents: many(student, { relationName: "studentFaculty" }),
  fieldOfStudyStudents: many(student, { relationName: "studentFieldOfStudy" }),
  highSchoolProfessionStudents: many(student, { relationName: "studentHighSchoolProfession" }),
  highSchoolCityStudents: many(student, { relationName: "studentHighSchoolCity" }),
  facultyCityStudents: many(student, { relationName: "studentFacultyCity" }),
}));
