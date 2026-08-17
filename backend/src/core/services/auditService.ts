import { db } from "../database/db.js";
import { auditLog } from "../database/student-schema.js";

export interface AuditEntry {
  actorId?: string | null;
  subjectUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  ipAddress?: string | null;
}

export const auditService = {
  async record(entry: AuditEntry) {
    await db.insert(auditLog).values({
      actorId: entry.actorId ?? null,
      subjectUserId: entry.subjectUserId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      ipAddress: entry.ipAddress ?? null,
    });
  },
};
