import { eq, and, isNull, ilike, sql, type SQL } from "drizzle-orm";
import { db } from "../database/db.js";
import { codebook } from "../database/codebook-schema.js";

const notDeleted = isNull(codebook.deletedAt);

export const codebookRepository = {
  async findById(id: string) {
    const result = await db
      .select()
      .from(codebook)
      .where(and(eq(codebook.id, id), notDeleted))
      .limit(1);
    return result[0] ?? null;
  },

  async findByTypeAndName(type: "faculty" | "field_of_study" | "high_school_profession" | "city", name: string) {
    const result = await db
      .select()
      .from(codebook)
      .where(and(eq(codebook.type, type), eq(codebook.name, name), notDeleted))
      .limit(1);
    return result[0] ?? null;
  },

  async findAllByType(type: "faculty" | "field_of_study" | "high_school_profession" | "city") {
    return db
      .select()
      .from(codebook)
      .where(and(eq(codebook.type, type), notDeleted))
      .orderBy(codebook.name);
  },

  async create(data: { type: "faculty" | "field_of_study" | "high_school_profession" | "city"; name: string; createdBy?: string }) {
    const result = await db.insert(codebook).values({
      type: data.type,
      name: data.name,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    }).returning();
    return result[0];
  },

  async update(id: string, data: { name?: string; updatedBy?: string }) {
    const result = await db
      .update(codebook)
      .set(data)
      .where(and(eq(codebook.id, id), notDeleted))
      .returning();
    return result[0] ?? null;
  },

  async softDelete(id: string, deletedBy?: string) {
    const result = await db
      .update(codebook)
      .set({ deletedAt: new Date(), deletedBy })
      .where(and(eq(codebook.id, id), notDeleted))
      .returning();
    return result[0] ?? null;
  },
};
