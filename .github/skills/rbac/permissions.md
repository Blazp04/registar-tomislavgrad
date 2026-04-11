# Permission & Role Definitions

## Defining Permissions (`permissions.ts`)

```typescript
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  vehicles: ["create", "read", "update", "delete"],
  reservations: ["create", "read", "update", "delete", "approve"],
  locations: ["create", "read", "update", "delete"],
  organizations: ["read", "manage"],
  drivers: ["read", "assign", "manage"],
  analytics: ["read"],
} as const;

export const ac = createAccessControl(statement);
```

## Role Definitions (`roles.ts`)

```typescript
import { ac } from "./permissions";
import { adminAc } from "better-auth/plugins/admin/access";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  COMPANY_ADMIN: "company_admin",
  COMPANY_USER: "company_user",
  NORMAL_USER: "normal_user",
  DRIVER: "driver",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const superAdmin = ac.newRole({
  ...adminAc.statements,
  vehicles: ["create", "read", "update", "delete"],
  reservations: ["create", "read", "update", "delete", "approve"],
  locations: ["create", "read", "update", "delete"],
  organizations: ["read", "manage"],
  drivers: ["read", "assign", "manage"],
  analytics: ["read"],
  user: ["create", "list", "set-role", "ban", "delete", "set-password", "impersonate", "impersonate-admins"],
  session: ["list", "revoke", "delete"],
});

export const companyAdmin = ac.newRole({
  vehicles: ["create", "read", "update", "delete"],
  reservations: ["create", "read", "update", "delete", "approve"],
  locations: ["create", "read", "update", "delete"],
  organizations: ["read"],
  drivers: ["read", "assign", "manage"],
  analytics: ["read"],
  user: ["create", "list"],
  session: ["list"],
});

export const companyUser = ac.newRole({
  vehicles: ["read"],
  reservations: ["create", "read", "update"],
  locations: ["read"],
  drivers: ["read"],
});

export const normalUser = ac.newRole({
  reservations: ["create", "read"],
  locations: ["read"],
  vehicles: ["read"],
});

export const driver = ac.newRole({
  reservations: ["read"],
  locations: ["read"],
  vehicles: ["read"],
  drivers: ["read"],
});
```

## Better Auth Plugin Config (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { ac } from "../core/config/permissions";
import { superAdmin, companyAdmin, companyUser, normalUser, driver } from "../core/config/roles";

export const auth = betterAuth({
  plugins: [
    admin({
      ac,
      roles: {
        super_admin: superAdmin,
        company_admin: companyAdmin,
        company_user: companyUser,
        normal_user: normalUser,
        driver: driver,
      },
      defaultRole: "normal_user",
    }),
  ],
});
```

## JWT with Permissions

```typescript
import { customSession } from "better-auth/plugins";

plugins: [
  customSession(async ({ user, session }) => {
    const userPermissions = await auth.api.userHasPermission({
      body: { userId: user.id },
    });
    return {
      user: { ...user, permissions: userPermissions },
      session,
    };
  }),
]
```
