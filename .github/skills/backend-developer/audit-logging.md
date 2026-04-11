# Audit Logging

Every mutation (create, update, soft-delete) MUST produce an audit log entry. Audit logs are immutable — never update or delete them.

## Audit Log Table

Create `src/core/database/audit-log-schema.ts`:

```typescript
import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "restore",
]);

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // What happened
  action: auditActionEnum("action").notNull(),
  entityType: text("entity_type").notNull(),   // e.g. "vehicle", "reservation"
  entityId: text("entity_id").notNull(),

  // Who did it
  userId: text("user_id")
    .references(() => user.id, { onDelete: "set null" }),

  // What changed — store old and new values
  changes: jsonb("changes"),  // { field: { old: "x", new: "y" } }

  // Context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  // Timestamp only — no updatedAt, no soft delete (audit logs are immutable)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**This table does NOT have `updatedAt`, `deletedAt`, or `isDeleted`** — audit logs are append-only and permanent.

## Audit Service

```typescript
import { db } from "../database";
import { auditLog } from "../database/audit-log-schema";

interface AuditEntry {
  action: "create" | "update" | "delete" | "restore";
  entityType: string;
  entityId: string;
  userId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  async log(entry: AuditEntry) {
    await db.insert(auditLog).values(entry);
  },

  // Compute diff between old and new record
  diff<T extends Record<string, unknown>>(
    oldRecord: T,
    newRecord: Partial<T>,
    ignoreKeys: string[] = ["updatedAt"]
  ): Record<string, { old: unknown; new: unknown }> | null {
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    for (const key of Object.keys(newRecord)) {
      if (ignoreKeys.includes(key)) continue;
      if (oldRecord[key] !== newRecord[key]) {
        changes[key] = { old: oldRecord[key], new: newRecord[key] };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  },
};
```

## Using in Services

### On Create

```typescript
async create(data: CreateVehicleDTO, user: AuthUser) {
  const vehicle = await vehicleRepository.create(data);

  await auditService.log({
    action: "create",
    entityType: "vehicle",
    entityId: vehicle.id,
    userId: user.id,
    changes: null,
  });

  return vehicle;
}
```

### On Update

```typescript
async update(id: string, data: UpdateVehicleDTO, user: AuthUser) {
  const existing = await vehicleRepository.findById(id);
  if (!existing) throw new NotFoundError("Vehicle not found");

  const changes = auditService.diff(existing, data);
  const updated = await vehicleRepository.update(id, data);

  if (changes) {
    await auditService.log({
      action: "update",
      entityType: "vehicle",
      entityId: id,
      userId: user.id,
      changes,
    });
  }

  return updated;
}
```

### On Soft Delete

```typescript
async remove(id: string, user: AuthUser) {
  const vehicle = await vehicleRepository.softDelete(id);
  if (!vehicle) throw new NotFoundError("Vehicle not found");

  await auditService.log({
    action: "delete",
    entityType: "vehicle",
    entityId: id,
    userId: user.id,
  });

  return vehicle;
}
```

## Rules

- **Every create, update, and soft-delete** in a service MUST call `auditService.log()`
- **Never skip audit** — even bulk operations must produce individual entries
- **Never modify or delete** audit log records
- **Store diffs on update** — use `auditService.diff()` to capture what changed
- **Pass userId** from the authenticated request — never log without attribution
- **Use transactions** when the audit log and the mutation must be atomic
