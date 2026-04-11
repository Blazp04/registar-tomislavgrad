import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import scalarPlugin from "@scalar/fastify-api-reference";
import { env } from "./core/config/env.js";
import { registerRoutes } from "./routes/index.js";
import { AppError } from "./core/utils/errors.js";
import { errorResponse } from "./core/utils/response.js";

async function start() {
  const fastify = Fastify({
    logger: env.NODE_ENV !== "test",
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // CORS
  await fastify.register(cors, {
    origin: env.CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  });

  // OpenAPI / Swagger
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Registar Tomislavgrad API",
        description: "Backend API for Registar Tomislavgrad",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  // Scalar API Reference (docs UI)
  await fastify.register(scalarPlugin, {
    routePrefix: "/docs",
  });

  // Global error handler
  fastify.setErrorHandler((error: Error, request, reply) => {
    if (error instanceof AppError) {
      return reply
        .status(error.statusCode)
        .send(errorResponse(error.code, error.message, error.errors));
    }

    if ("validation" in error) {
      return reply
        .status(422)
        .send(errorResponse("VALIDATION_ERROR", "Request validation failed"));
    }

    request.log.error(error);
    return reply
      .status(500)
      .send(
        errorResponse(
          "INTERNAL_SERVER_ERROR",
          "An unexpected error occurred",
        ),
      );
  });

  // Register application routes
  await registerRoutes(fastify);

  // Expose OpenAPI JSON spec (used by frontend sync-schema)
  fastify.get("/documentation/json", { schema: { hide: true } }, () => {
    return fastify.swagger();
  });

  // Start server
  await fastify.listen({ port: env.PORT, host: "0.0.0.0" });
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`API Docs: http://localhost:${env.PORT}/docs`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    await fastify.close();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
