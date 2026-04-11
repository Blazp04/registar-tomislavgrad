# Backend Code Patterns

## Handler

Thin — parse request, call service, format response:

```typescript
export async function getVehicleHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const vehicle = await vehicleService.getById(request.params.id);
  return reply.send(successResponse(vehicle));
}
```

## Service

Business rules, orchestrates repositories:

```typescript
export const vehicleService = {
  async getById(id: string) {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) throw new NotFoundError("Vehicle not found");
    return vehicle;
  },

  async create(data: CreateVehicleDTO, organizationId: string) {
    const existing = await vehicleRepository.findByPlate(data.plate);
    if (existing) throw new ConflictError("Vehicle with this plate already exists");
    return vehicleRepository.create({ ...data, organizationId });
  },
};
```

## Route with OpenAPI

```typescript
fastify.route({
  method: "POST",
  url: "/vehicles",
  schema: {
    description: "Create a new vehicle",
    tags: ["Vehicles"],
    security: [{ bearerAuth: [] }],
    body: createVehicleSchema,
    response: {
      201: vehicleResponseSchema,
    },
  },
  preHandler: [authPreHandler, requirePermission("vehicles.create")],
  handler: createVehicleHandler,
});
```

## Response Helpers

```typescript
import { successResponse, errorResponse } from "../core/utils/response";

// Success
return reply.send(successResponse(data));

// With pagination
return reply.send(successResponse(data, {
  page: 1,
  limit: 10,
  total: 100,
  totalPages: 10,
  hasNextPage: true,
  hasPreviousPage: false,
}));
```

## Auth — Route with Permission Guard

```typescript
import { authPreHandler, requirePermission } from "../core/middleware/authMiddleware";

// Protected route — requires authentication + permission
fastify.route({
  method: "POST",
  url: "/vehicles",
  schema: {
    description: "Create a new vehicle",
    tags: ["Vehicles"],
    security: [{ bearerAuth: [] }],
    body: createVehicleSchema,
    response: { 201: vehicleResponseSchema },
  },
  preHandler: [authPreHandler, requirePermission("vehicles.create")],
  handler: createVehicleHandler,
});

// Auth only — any authenticated user, no specific permission
fastify.route({
  method: "GET",
  url: "/profile",
  schema: {
    description: "Get current user profile",
    tags: ["Profile"],
    security: [{ bearerAuth: [] }],
    response: { 200: profileResponseSchema },
  },
  preHandler: [authPreHandler],
  handler: getProfileHandler,
});

// Public route — no auth at all
fastify.route({
  method: "GET",
  url: "/health",
  schema: { description: "Health check", tags: ["System"] },
  handler: (_, reply) => reply.send({ status: "ok" }),
});
```

## Auth — Accessing User in Handler/Service

```typescript
// Handler — extract user from request and pass to service
export async function createVehicleHandler(
  request: FastifyRequest<{ Body: CreateVehicleDTO }>,
  reply: FastifyReply
) {
  const vehicle = await vehicleService.create(request.body, request.user);
  return reply.status(201).send(successResponse(vehicle));
}

// Service — user is typed as AuthUser from the JWT
export const vehicleService = {
  async create(data: CreateVehicleDTO, user: AuthUser) {
    // user.id, user.role, user.organizationId are available
    return vehicleRepository.create({
      ...data,
      organizationId: user.organizationId,
      createdBy: user.id,
    });
  },
};
```
