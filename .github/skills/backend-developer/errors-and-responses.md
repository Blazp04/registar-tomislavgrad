# Error & Response Utilities

If `src/core/utils/errors.ts` or `response.ts` don't exist, create them using these templates.

## errors.ts

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, "BAD_REQUEST", message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors?: Record<string, string[]>) {
    super(422, "VALIDATION_ERROR", message, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(500, "INTERNAL_SERVER_ERROR", message);
  }
}
```

## response.ts

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  };
}

export function successResponse<T>(data: T, meta?: PaginationMeta): SuccessResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function errorResponse(
  code: string,
  message: string,
  errors?: Record<string, string[]>
): ErrorResponseBody {
  return {
    success: false,
    error: { code, message, ...(errors && { errors }) },
  };
}
```

## errorHandler (Fastify plugin)

Register this in `server.ts`:

```typescript
import { AppError } from "./core/utils/errors";
import { errorResponse } from "./core/utils/response";

fastify.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(
      errorResponse(error.code, error.message, error.errors)
    );
  }

  // Fastify validation errors
  if (error.validation) {
    return reply.status(422).send(
      errorResponse("VALIDATION_ERROR", "Request validation failed")
    );
  }

  request.log.error(error);
  return reply.status(500).send(
    errorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred")
  );
});
```
