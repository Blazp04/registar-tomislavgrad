# Standard Table Template

Each table lives in its own file: `src/core/database/[entity]-schema.ts`.

## Example: `vehicle-schema.ts`

```typescript
import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { user, organization } from "./auth-schema";

export const vehicle = pgTable("vehicle", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Domain fields
  plate: text("plate").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year"),

  // Foreign keys
  organizationId: text("organization_id").notNull()
    .references(() => organization.id, { onDelete: "restrict" }),

  // Audit columns — REQUIRED on every table
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: text("created_by")
    .references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  updatedBy: text("updated_by")
    .references(() => user.id, { onDelete: "set null" }),

  // Soft delete — REQUIRED on every table
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by")
    .references(() => user.id, { onDelete: "set null" }),
}, (table) => [
  index("vehicle_organization_id_idx").on(table.organizationId),
  index("vehicle_plate_idx").on(table.plate),
  index("vehicle_deleted_at_idx").on(table.deletedAt),
]);
```

## Relations

Define separately from the table:

```typescript
import { relations } from "drizzle-orm";

export const vehicleRelations = relations(vehicle, ({ one, many }) => ({
  organization: one(organization, {
    fields: [vehicle.organizationId],
    references: [organization.id],
  }),
  reservations: many(reservation),
}));
```

## Index Rules

Always index: foreign keys, columns in WHERE/ORDER BY, `deletedAt`.

## File Naming Convention

- Table + relations in one file: `vehicle-schema.ts`, `reservation-schema.ts`
- Always re-export from `schema.ts`
- Keep `auth-schema.ts` as a single file (Better Auth managed)
