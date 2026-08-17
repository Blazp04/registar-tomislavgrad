import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import scalarPlugin from "@scalar/fastify-api-reference";
import { env } from "./core/config/env.js";
import { registerRoutes } from "./routes/index.js";
import { AppError, ForbiddenError } from "./core/utils/errors.js";
import { errorResponse } from "./core/utils/response.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function buildServer() {
  const fastify = Fastify({
    logger: env.NODE_ENV !== "test",
    trustProxy: true,
    bodyLimit: 1024 * 1024,
    requestIdHeader: "x-request-id",
  });

  await fastify.register(helmet, {
    global: true,
    contentSecurityPolicy: env.NODE_ENV === "production",
    strictTransportSecurity: env.NODE_ENV === "production"
      ? { maxAge: 31_536_000, includeSubDomains: true }
      : false,
  });
  await fastify.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await fastify.register(cors, {
    origin: env.CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Requested-With", "X-Request-ID"],
    credentials: true,
  });

  fastify.addHook("onRequest", async (request, reply) => {
    if (env.NODE_ENV === "production" && request.protocol !== "https") {
      return reply.status(426).send(errorResponse("HTTPS_REQUIRED", "Za pristup je potreban HTTPS"));
    }
    if (request.url.startsWith("/api/") && unsafeMethods.has(request.method)) {
      const origin = request.headers.origin;
      if (origin && !env.CORS_ORIGINS.includes(origin)) {
        throw new ForbiddenError("Zahtjev nije poslan s dopuštenog izvora");
      }
      if (env.NODE_ENV === "production" && !origin) {
        throw new ForbiddenError("Nedostaje sigurnosno zaglavlje izvora zahtjeva");
      }
    }
  });

  fastify.addHook("onSend", async (request, reply, payload) => {
    if (request.url.startsWith("/api/")) reply.header("Cache-Control", "no-store");
    return payload;
  });

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Registar studenata i stipendija API",
        description: "API Općine Tomislavgrad za studentske profile, obrazovanje, stipendije i administraciju.",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          sessionCookie: { type: "apiKey", in: "cookie", name: "better-auth.session_token" },
        },
      },
    },
  });
  await fastify.register(scalarPlugin, { routePrefix: "/docs" });

  fastify.setErrorHandler((error: Error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(errorResponse(error.code, error.message, error.errors));
    }
    if ("validation" in error) {
      return reply.status(422).send(errorResponse("VALIDATION_ERROR", "Provjerite unesene podatke"));
    }
    request.log.error({ err: error, requestId: request.id }, "Unhandled request error");
    return reply.status(500).send(errorResponse("INTERNAL_SERVER_ERROR", "Dogodila se neočekivana pogreška"));
  });

  await registerRoutes(fastify);
  fastify.get("/documentation/json", { schema: { hide: true } }, () => fastify.swagger());
  return fastify;
}

async function start() {
  const fastify = await buildServer();
  await fastify.listen({ port: env.PORT, host: "0.0.0.0" });
  fastify.log.info(`Server running on http://localhost:${env.PORT}`);

  const shutdown = async (signal: string) => {
    fastify.log.info({ signal }, "Shutting down");
    await fastify.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

if (env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
}
