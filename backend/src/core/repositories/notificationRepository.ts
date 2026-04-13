import { eq, and, isNull, desc, sql, count } from "drizzle-orm";
import { db } from "../database/db.js";
import { notification } from "../database/notification-schema.js";
import { user } from "../database/auth-schema.js";

const notDeleted = isNull(notification.deletedAt);

export const notificationRepository = {
  async createMany(records: Array<{
    studentId: string;
    type: "email" | "sms";
    subject?: string | null;
    content: string;
    sentBy?: string | null;
  }>) {
    if (records.length === 0) return [];
    return db.insert(notification).values(records).returning();
  },

  async findByStudentId(studentId: string, opts?: { page?: number; limit?: number }) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 20;
    const offset = (page - 1) * limit;

    const where = and(eq(notification.studentId, studentId), notDeleted);

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: notification.id,
          type: notification.type,
          subject: notification.subject,
          content: notification.content,
          sentAt: notification.sentAt,
          senderName: user.name,
        })
        .from(notification)
        .leftJoin(user, eq(notification.sentBy, user.id))
        .where(where)
        .orderBy(desc(notification.sentAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(notification)
        .where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  },
};
