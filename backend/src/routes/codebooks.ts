import type { FastifyInstance } from "fastify";
import { authPreHandler } from "../core/middleware/authMiddleware.js";
import {
  getCodebooksByTypeHandler,
  createCodebookHandler,
  updateCodebookHandler,
  deleteCodebookHandler,
} from "../handlers/codebookHandler.js";

const codebookItemSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { type: "string", enum: ["faculty", "field_of_study", "high_school_profession", "city"] },
    name: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const successListSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: { type: "array", items: codebookItemSchema },
  },
};

const successItemSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: codebookItemSchema,
  },
};

export function registerCodebookRoutes(fastify: FastifyInstance) {
  // Public — anyone can read codebook values (for the public registration form)
  fastify.route({
    method: "GET",
    url: "/api/codebooks/:type",
    schema: {
      description: "Get all codebook entries by type",
      tags: ["Codebooks"],
      params: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["faculty", "field_of_study", "high_school_profession", "city"] },
        },
        required: ["type"],
      },
      response: { 200: successListSchema },
    },
    handler: getCodebooksByTypeHandler,
  });

  // Admin only — CRUD
  fastify.route({
    method: "POST",
    url: "/api/codebooks",
    schema: {
      description: "Create a codebook entry",
      tags: ["Codebooks"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["faculty", "field_of_study", "high_school_profession", "city"] },
          name: { type: "string", minLength: 2 },
        },
        required: ["type", "name"],
      },
      response: { 201: successItemSchema },
    },
    preHandler: [authPreHandler],
    handler: createCodebookHandler,
  });

  fastify.route({
    method: "PUT",
    url: "/api/codebooks/:id",
    schema: {
      description: "Update a codebook entry",
      tags: ["Codebooks"],
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      body: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
        },
        required: ["name"],
      },
      response: { 200: successItemSchema },
    },
    preHandler: [authPreHandler],
    handler: updateCodebookHandler,
  });

  fastify.route({
    method: "DELETE",
    url: "/api/codebooks/:id",
    schema: {
      description: "Delete a codebook entry",
      tags: ["Codebooks"],
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      response: { 204: { type: "null" } },
    },
    preHandler: [authPreHandler],
    handler: deleteCodebookHandler,
  });
}
