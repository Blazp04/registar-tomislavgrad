import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../database/db.js";
import { codebook, type CodebookType } from "../database/codebook-schema.js";

const active = isNull(codebook.deletedAt);

export const codebookRepository = {
  async findById(id: string) {
    const [item] = await db.select().from(codebook).where(and(eq(codebook.id, id), active)).limit(1);
    return item ?? null;
  },

  async findByTypeAndName(type: CodebookType, name: string) {
    const [item] = await db
      .select()
      .from(codebook)
      .where(and(eq(codebook.type, type), sql`lower(${codebook.name}) = lower(${name})`, active))
      .limit(1);
    return item ?? null;
  },

  async findAllByType(type: CodebookType, includeUnofficial = false) {
    return db
      .select()
      .from(codebook)
      .where(and(eq(codebook.type, type), active, includeUnofficial ? undefined : eq(codebook.isOfficial, true)))
      .orderBy(codebook.isOfficial, codebook.name);
  },

  async create(data: { type: CodebookType; name: string; isOfficial: boolean; createdBy?: string }) {
    const [item] = await db.insert(codebook).values({
      ...data,
      updatedBy: data.createdBy,
    }).returning();
    return item;
  },

  async update(id: string, data: { name?: string; isOfficial?: boolean; updatedBy?: string }) {
    const [item] = await db.update(codebook).set(data).where(and(eq(codebook.id, id), active)).returning();
    return item ?? null;
  },

  async softDelete(id: string, deletedBy?: string) {
    const [item] = await db
      .update(codebook)
      .set({ deletedAt: new Date(), deletedBy })
      .where(and(eq(codebook.id, id), active))
      .returning();
    return item ?? null;
  },
};
