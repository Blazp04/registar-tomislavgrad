# Repository Pattern

Every repository MUST filter out soft-deleted records by default.

```typescript
import { eq, and, isNull } from "drizzle-orm";
import { db } from "../database";
import { vehicle } from "../database/app-schema";

const notDeleted = isNull(vehicle.deletedAt);

export const vehicleRepository = {
  async findById(id: string) {
    const result = await db
      .select()
      .from(vehicle)
      .where(and(eq(vehicle.id, id), notDeleted))
      .limit(1);
    return result[0] ?? null;
  },

  async findAll(organizationId: string) {
    return db
      .select()
      .from(vehicle)
      .where(and(eq(vehicle.organizationId, organizationId), notDeleted));
  },

  async create(data: NewVehicle) {
    const result = await db.insert(vehicle).values(data).returning();
    return result[0];
  },

  async update(id: string, data: Partial<NewVehicle>) {
    const result = await db
      .update(vehicle)
      .set(data)
      .where(and(eq(vehicle.id, id), notDeleted))
      .returning();
    return result[0] ?? null;
  },

  // Soft delete — NEVER use db.delete()
  async softDelete(id: string) {
    const result = await db
      .update(vehicle)
      .set({ deletedAt: new Date(), isDeleted: true })
      .where(and(eq(vehicle.id, id), notDeleted))
      .returning();
    return result[0] ?? null;
  },

  // Only for admin recovery
  async restore(id: string) {
    const result = await db
      .update(vehicle)
      .set({ deletedAt: null, isDeleted: false })
      .where(eq(vehicle.id, id))
      .returning();
    return result[0] ?? null;
  },
};
```
