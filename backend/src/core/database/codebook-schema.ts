import { boolean, index, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

export const codebookTypeValues = [
  "country",
  "city",
  "municipality_settlement",
  "high_school",
  "university",
  "faculty",
  "study_program",
  "study_level",
  "scholarship_type",
  "scholarship_provider",
] as const;

export const codebookTypeEnum = pgEnum("codebook_type_v2", codebookTypeValues);

export const codebook = pgTable("codebooks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: codebookTypeEnum("type").notNull(),
  name: text("name").notNull(),
  isOfficial: boolean("is_official").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by").references(() => user.id, { onDelete: "set null" }),
}, (table) => [
  unique("codebooks_type_name_uq").on(table.type, table.name),
  index("codebooks_type_idx").on(table.type),
  index("codebooks_name_idx").on(table.name),
  index("codebooks_official_idx").on(table.isOfficial),
  index("codebooks_deleted_at_idx").on(table.deletedAt),
]);

export type CodebookType = (typeof codebookTypeValues)[number];
