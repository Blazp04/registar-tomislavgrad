import { pgTable, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema.js";
import { student } from "./student-schema.js";

export const notificationTypeEnum = pgEnum("notification_type", [
  "email",
  "sms",
]);

export const notification = pgTable("notification", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  studentId: text("student_id").notNull()
    .references(() => student.id, { onDelete: "restrict" }),
  type: notificationTypeEnum("type").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),

  sentBy: text("sent_by")
    .references(() => user.id, { onDelete: "set null" }),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by")
    .references(() => user.id, { onDelete: "set null" }),
}, (table) => [
  index("notification_student_id_idx").on(table.studentId),
  index("notification_type_idx").on(table.type),
  index("notification_sent_at_idx").on(table.sentAt),
  index("notification_deleted_at_idx").on(table.deletedAt),
]);

export const notificationRelations = relations(notification, ({ one }) => ({
  student: one(student, {
    fields: [notification.studentId],
    references: [student.id],
  }),
  sender: one(user, {
    fields: [notification.sentBy],
    references: [user.id],
  }),
}));
