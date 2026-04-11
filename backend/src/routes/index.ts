import type { FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./health.js";
import { registerAuthRoutes } from "./auth.js";

export async function registerRoutes(fastify: FastifyInstance) {
  registerHealthRoutes(fastify);
  registerAuthRoutes(fastify);
}
