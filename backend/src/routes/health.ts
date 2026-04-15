import type { FastifyInstance } from "fastify";
import { checkDbConnection } from "../core/database/db.js";

export function registerHealthRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/health",
    schema: {
      description: "Health check",
      tags: ["System"],
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
          },
        },
        503: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
          },
        },
      },
    },
    handler: async (_request, reply) => {
      const dbHealthy = await checkDbConnection();

      const status = dbHealthy ? "ok" : "degraded";
      const statusCode = dbHealthy ? 200 : 503;

      return reply.status(statusCode).send({
        status,
        timestamp: new Date().toISOString(),
      });
    },
  });
}
