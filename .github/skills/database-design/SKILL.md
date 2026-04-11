---
name: database-design
description: Designs database schemas with Drizzle ORM and PostgreSQL. Enforces soft delete on every table, audit columns, proper indexing, and the repository pattern. Use when creating tables, writing migrations, defining relations, or building data access layers.
---

# Database Design with Drizzle ORM

Work in the `backend/` directory. Only write comments that provide business context not inferable from code.

## Critical Rule: ALWAYS Soft Delete

**NEVER hard delete records. NEVER use `db.delete()`.** Every application table MUST have `deletedAt` columns. Every repository query MUST filter out soft-deleted records by default.

## Schema File Organization

**One file per table** for application schemas. Only Better Auth tables stay together in one file.

| File | Purpose | Editable? |
|------|---------|-----------|  
| `src/core/database/auth-schema.ts` | All Better Auth tables (user, session, account, organization) | **Only for auth related work** |
| `src/core/database/[entity]-schema.ts` | One table per file: `vehicle-schema.ts`, `reservation-schema.ts`, etc. | **YES** |
| `src/core/database/audit-log-schema.ts` | Audit log table (append-only, no soft delete) | **YES** |
| `src/core/database/schema.ts` | Re-exports all schema files | Update when adding tables |

### File naming

- `vehicle-schema.ts` — contains `vehicle` table + `vehicleRelations`
- `reservation-schema.ts` — contains `reservation` table + `reservationRelations`
- `location-schema.ts` — contains `location` table + `locationRelations`

### schema.ts re-export

```typescript
// src/core/database/schema.ts
export * from "./auth-schema";
export * from "./vehicle-schema";
export * from "./reservation-schema";
export * from "./location-schema";
export * from "./audit-log-schema";
```

Update `drizzle.config.ts` to include the `src/core/database/` directory.

## Required Columns on Every Table

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `text` (UUID) | `$defaultFn(() => crypto.randomUUID())` |
| `createdAt` | `timestamp(tz)` | Auto-set on insert |
| `createdBy` | `text` (UUID) | Auto-set on insert |
| `updatedAt` | `timestamp(tz)` | Auto-set on insert + update |
| `updatedBy` | `text` (UUID) | Auto-set on insert + update |
| `deletedAt` | `timestamp(tz, nullable)` | Set when soft-deleted |
| `deletedBy` | `text` (UUID) | Set when soft-deleted |

## Table Template

See [table-template.md](table-template.md) for the standard table definition with all required columns, relations, foreign key rules, and index patterns.

## Repository Pattern

See [repository-pattern.md](repository-pattern.md) for the complete CRUD repository with soft delete filtering baked in.

## Foreign Key Rules

| Scenario | `onDelete` |
|----------|------------|
| Child cannot exist without parent | `restrict` |
| Auth/user references | `set null` |
| Owned child (profile, settings) | `cascade` |

Prefer `restrict` — soft delete means parents are rarely actually deleted.

## Migration Workflow

```bash
cd backend
npm run db:generate   # Generate migration from schema
npm run db:push       # Direct push — dev ONLY
```

1. Always generate — never write migration SQL manually
2. Review generated SQL before applying
3. Never drop columns in production
4. Add indexes for foreign keys, WHERE columns, and `deletedAt`

## Enum Pattern

```typescript
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available", "in_use", "maintenance", "retired",
]);

// In table:
status: vehicleStatusEnum("status").default("available").notNull(),
```

## Transactions

```typescript
await db.transaction(async (tx) => {
  const newVehicle = await tx.insert(vehicle).values(data).returning();
  await tx.insert(vehicleHistory).values({
    vehicleId: newVehicle[0].id,
    action: "created",
  });
  return newVehicle[0];
});
```

## Rules

✅ Soft delete everywhere, audit columns on every table, `restrict` FK default, generate migrations, index FKs + filters, transactions for multi-table writes

❌ Never `db.delete()`,  never write raw SQL unless Drizzle can't express it, never skip audit columns, never drop production columns
