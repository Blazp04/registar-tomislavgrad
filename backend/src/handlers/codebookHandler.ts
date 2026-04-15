import type { FastifyRequest, FastifyReply } from "fastify";
import { codebookService } from "../core/services/codebookService.js";
import { successResponse } from "../core/utils/response.js";
import { ValidationError } from "../core/utils/errors.js";
import { createCodebookSchema, updateCodebookSchema, type CreateCodebookDTO, type UpdateCodebookDTO } from "../dto/codebook.js";
import { z } from "zod";

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

export async function getCodebooksByTypeHandler(
  request: FastifyRequest<{ Params: { type: "faculty" | "field_of_study" | "high_school_profession" | "city" } }>,
  reply: FastifyReply
) {
  const items = await codebookService.getAllByType(request.params.type);
  return reply.send(successResponse(items));
}

export async function createCodebookHandler(
  request: FastifyRequest<{ Body: CreateCodebookDTO }>,
  reply: FastifyReply
) {
  const parsed = createCodebookSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError("Validacija nije uspjela", formatZodErrors(parsed.error));
  }
  const userId = request.user?.id;
  const item = await codebookService.create(parsed.data, userId);
  return reply.status(201).send(successResponse(item));
}

export async function updateCodebookHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateCodebookDTO }>,
  reply: FastifyReply
) {
  const parsed = updateCodebookSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError("Validacija nije uspjela", formatZodErrors(parsed.error));
  }
  const userId = request.user?.id;
  const item = await codebookService.update(request.params.id, parsed.data, userId);
  return reply.send(successResponse(item));
}

export async function deleteCodebookHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user?.id;
  await codebookService.remove(request.params.id, userId);
  return reply.status(204).send();
}
