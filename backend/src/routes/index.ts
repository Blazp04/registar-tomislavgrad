import type { FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./health.js";
import { registerAuthRoutes } from "./auth.js";
import { registerCodebookRoutes } from "./codebooks.js";
import { registerStudentRoutes } from "./students.js";

export async function registerRoutes(fastify: FastifyInstance) {
  registerHealthRoutes(fastify);
  registerAuthRoutes(fastify);
  registerCodebookRoutes(fastify);
  registerStudentRoutes(fastify);
}
