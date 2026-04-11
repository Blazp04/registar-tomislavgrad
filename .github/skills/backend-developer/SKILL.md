---
name: backend-developer
description: Develops Fastify + Drizzle ORM + Better Auth backend API in the backend/ directory. Use when creating endpoints, handlers, services, repositories, DTOs, or working with the backend architecture. Handles OpenAPI schemas, error handling, and response formatting.
---

# Backend Development

Work exclusively in the `backend/` directory. Only write comments that provide business context not inferable from code.

## Tech Stack

| Layer          | Technology          |
| -------------- | ------------------- |
| Runtime        | Node.js + TypeScript|
| Framework      | Fastify             |
| ORM            | Drizzle ORM         |
| Auth           | Better Auth (JWT)   |
| Validation     | Zod                 |
| Build          | tsx / tsc           |
| API Docs       | OpenAPI (Scalar UI) |

## Architecture

Layered — each layer has a single responsibility:

- **Routes** (`src/routes/`) — Route definitions with OpenAPI schemas. No logic.
- **Handlers** (`src/handlers/`) — HTTP layer only. Parse request, call service, format response.
- **Services** (`src/core/services/`) — Business logic. Orchestrates repositories, enforces rules.
- **Repositories** (`src/core/repositories/`) — Data access with Drizzle ORM. No business logic.
- **DTOs** (`src/dto/`) — Zod schemas for request/response validation.

## Project Structure

```
backend/src/
├── server.ts                       # Fastify server setup
├── routes/
│   ├── index.ts                    # Route registration
│   └── [entity].ts                 # Route definitions per domain
├── handlers/
│   └── [entity]Handler.ts          # HTTP handlers
├── core/
│   ├── services/                   # Business logic
│   ├── repositories/               # Data access
│   ├── database/
│   │   ├── schema.ts               # Re-exports all schema files
│   │   ├── auth-schema.ts          # Better Auth managed (DON'T MODIFY)
│   │   ├── audit-log-schema.ts     # Audit log table (append-only)
│   │   └── [entity]-schema.ts      # One file per table (vehicle-schema.ts, etc.)
│   ├── middleware/
│   │   └── authMiddleware.ts       # Auth + permission guards
│   ├── config/
│   │   ├── env.ts                  # Zod-validated environment
│   │   ├── roles.ts                # Role definitions
│   │   └── permissions.ts          # Permission definitions + access control
│   └── utils/
│       ├── errors.ts               # Custom error classes
│       └── response.ts             # Standard response helpers
├── dto/                            # Zod DTOs per domain
├── lib/
│   └── auth.ts                     # Better Auth configuration
└── types/                          # Shared TypeScript types
```

## Patterns

See [patterns.md](patterns.md) for handler, service, route, and auth middleware examples.

## Error & Response Utilities

See [errors-and-responses.md](errors-and-responses.md) for the full `errors.ts`, `response.ts`, and `errorHandler` implementation. If these files don't exist in the project, create them from the templates.

## Audit Logging

Every mutation (create, update, soft-delete) MUST produce an audit log. See [audit-logging.md](audit-logging.md) for the audit log table, service, and usage patterns.

## Error Handling

Use custom error classes from `src/core/utils/errors.ts`:

| Error | Status |
|-------|--------|
| `BadRequestError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |
| `ValidationError` | 422 |
| `InternalServerError` | 500 |

Let errors propagate — the global `errorHandler` middleware handles them. Do NOT catch errors in handlers unless transforming them.

## Response Format

Always use `successResponse` / `errorResponse` from `src/core/utils/response.ts`.

## OpenAPI

All routes **MUST** include OpenAPI schema — the frontend generates types from it. View docs at `http://localhost:3000/docs` (Scalar UI).

## Adding New Endpoints

1. Create or edit`src/core/database/[entity]-schema.ts` (see `database-design` skill)
2. `npm run db:generate`
3. Repository in `src/core/repositories/[entity]Repository.ts`
4. DTOs in `src/dto/[entity]/`
5. Service in `src/core/services/[entity]Service.ts`
6. Handler in `src/handlers/[entity]Handler.ts`
7. Routes with OpenAPI in `src/routes/[entity].ts`
8. Register in `src/routes/index.ts`
9. Add permissions if needed (see `rbac` skill)
10. Notify frontend to run `npm run sync-schema`

## Rules

✅ OpenAPI on every endpoint, Zod DTOs, custom error classes, thin handlers, smart services, dumb repositories, audit log on every mutation

❌ No business logic in handlers/repositories, no hard deletes (see `database-design` skill), no direct role checks (see `rbac` skill), never modify `auth-schema.ts`, never skip OpenAPI, never skip audit logging

## Commands

```bash
cd backend
npm run dev          # Hot reload (nodemon + tsx)
npm run build        # TypeScript compilation
npm run prod         # Production build + start
npm run db:generate  # Create migration from schema
npm run db:push      # Direct push (dev only)
npm run db:studio    # Visual DB editor
```

## MCP

Use the **Better Auth MCP** when implementing auth features.
