---
name: rbac
description: Implements permission-based access control with Better Auth. Use when protecting routes, defining permissions, mapping roles to permissions, or adding authorization checks. Enforces resource.action permission format and never checking roles directly.
---

# Permission-Based RBAC

Work in the `backend/` directory. Only write comments that provide business context not inferable from code.

## Core Principle

**Check permissions, NEVER roles.** Roles exist only to group permissions.

```typescript
// ✅ CORRECT
preHandler: [authPreHandler, requirePermission("vehicles.create")]

// ❌ WRONG
preHandler: [authPreHandler, requireRole([ROLES.SUPER_ADMIN])]
```

## Permission Format

```
resource.action
```

Examples: `vehicles.create`, `users.ban`, `mobile.analytics.read`, `reservations.approve`, `drivers.assign`

## Architecture

```
src/core/config/
├── permissions.ts    # Permission definitions + createAccessControl
└── roles.ts          # Role-to-permission mappings

src/core/middleware/
└── authMiddleware.ts  # authPreHandler + requirePermission
```

## Defining Permissions

See [permissions.md](permissions.md) for the full `createAccessControl` setup and role definitions.

## Route Protection

See [middleware.md](middleware.md) for `authPreHandler`, `requirePermission`, and `requirePermissions` middleware implementation.

## Using in Routes

```typescript
// Single permission
preHandler: [authPreHandler, requirePermission("vehicles.create")]

// Multiple permissions (ALL required)
preHandler: [authPreHandler, requirePermissions(["reservations.read", "reservations.approve"])]

// Auth only — any authenticated user
preHandler: [authPreHandler]
```

## Service-Level Checks

For org-scoped access beyond route guards:

```typescript
async update(id: string, data: UpdateVehicleDTO, user: AuthUser) {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw new NotFoundError("Vehicle not found");

  if (vehicle.organizationId !== user.organizationId) {
    throw new ForbiddenError("Cannot modify vehicles from another organization");
  }

  return vehicleRepository.update(id, data);
}
```

## Adding New Permissions

1. Add to `permissions.ts` statement
2. Assign to roles in `roles.ts`
3. Apply with `requirePermission()` in route
4. `npm run db:generate` if Better Auth schema changed
5. Update frontend if permission affects UI

## Rules

✅ `resource.action` format, permissions in JWT, org-scoped checks in services, all permissions in `permissions.ts`

❌ Never `requireRole()`, never hardcode role names in logic, never skip permission for authenticated endpoints
