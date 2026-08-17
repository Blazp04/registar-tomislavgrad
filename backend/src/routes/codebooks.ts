import type { FastifyInstance } from "fastify";
import { adminPreHandler, studentPreHandler } from "../core/middleware/authMiddleware.js";
import {
  createCodebookHandler,
  deleteCodebookHandler,
  getAdminCodebooksByTypeHandler,
  getCodebooksByTypeHandler,
  suggestCodebookHandler,
  updateCodebookHandler,
} from "../handlers/codebookHandler.js";

export function registerCodebookRoutes(fastify: FastifyInstance) {
  fastify.get("/api/codebooks/:type", { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } }, getCodebooksByTypeHandler);
  fastify.get("/api/admin/codebooks/:type", { preHandler: [adminPreHandler] }, getAdminCodebooksByTypeHandler);
  fastify.post("/api/codebooks/suggestions", { preHandler: [studentPreHandler], config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, suggestCodebookHandler);
  fastify.post("/api/codebooks", { preHandler: [adminPreHandler] }, createCodebookHandler);
  fastify.put("/api/codebooks/:id", { preHandler: [adminPreHandler] }, updateCodebookHandler);
  fastify.delete("/api/codebooks/:id", { preHandler: [adminPreHandler] }, deleteCodebookHandler);
}
