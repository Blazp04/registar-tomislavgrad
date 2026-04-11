# Auth Middleware

## authPreHandler

Verifies JWT and attaches user to request:

```typescript
export async function authPreHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new UnauthorizedError("Missing authentication token");

  const session = await verifyJWT(token);
  if (!session) throw new UnauthorizedError("Invalid or expired token");

  request.user = session.user;
}
```

## requirePermission

Checks a single `resource.action` permission:

```typescript
export function requirePermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) throw new UnauthorizedError("Not authenticated");

    const [resource, action] = permission.split(".");

    const hasAccess = await auth.api.userHasPermission({
      body: {
        userId: request.user.id,
        permissions: { [resource]: [action] },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
  };
}
```

## requirePermissions

Checks multiple permissions (ALL required):

```typescript
export function requirePermissions(permissions: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) throw new UnauthorizedError("Not authenticated");

    const permissionMap: Record<string, string[]> = {};
    for (const perm of permissions) {
      const [resource, action] = perm.split(".");
      if (!permissionMap[resource]) permissionMap[resource] = [];
      permissionMap[resource].push(action);
    }

    const hasAccess = await auth.api.userHasPermission({
      body: {
        userId: request.user.id,
        permissions: permissionMap,
      },
    });

    if (!hasAccess) {
      throw new ForbiddenError("Insufficient permissions");
    }
  };
}
```
