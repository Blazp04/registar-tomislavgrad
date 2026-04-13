import type { FastifyRequest, FastifyReply } from "fastify";
import { codebookService } from "../core/services/codebookService.js";
import { successResponse } from "../core/utils/response.js";
import type { CreateCodebookDTO, UpdateCodebookDTO } from "../dto/codebook.js";

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
  const userId = (request as any).user?.id;
  const item = await codebookService.create(request.body, userId);
  return reply.status(201).send(successResponse(item));
}

export async function updateCodebookHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateCodebookDTO }>,
  reply: FastifyReply
) {
  const userId = (request as any).user?.id;
  const item = await codebookService.update(request.params.id, request.body, userId);
  return reply.send(successResponse(item));
}

export async function deleteCodebookHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = (request as any).user?.id;
  await codebookService.remove(request.params.id, userId);
  return reply.status(204).send();
}
