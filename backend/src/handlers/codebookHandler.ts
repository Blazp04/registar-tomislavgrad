import type { FastifyReply, FastifyRequest } from "fastify";
import { codebookTypeSchema, createCodebookSchema, updateCodebookSchema } from "../dto/codebook.js";
import { codebookService } from "../core/services/codebookService.js";
import { successResponse } from "../core/utils/response.js";
import { parseWithSchema } from "../core/utils/validation.js";

const requestIp = (request: FastifyRequest) => request.ip;
const params = <T>(request: FastifyRequest) => request.params as T;

export async function getCodebooksByTypeHandler(request: FastifyRequest, reply: FastifyReply) {
  const type = parseWithSchema(codebookTypeSchema, params<{ type: string }>(request).type);
  return reply.send(successResponse(await codebookService.getAllByType(type, false)));
}

export async function getAdminCodebooksByTypeHandler(request: FastifyRequest, reply: FastifyReply) {
  const type = parseWithSchema(codebookTypeSchema, params<{ type: string }>(request).type);
  return reply.send(successResponse(await codebookService.getAllByType(type, true)));
}

export async function suggestCodebookHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(createCodebookSchema.pick({ type: true, name: true }), request.body);
  const item = await codebookService.suggest(data.type, data.name, request.user!.id);
  return reply.status(201).send(successResponse(item));
}

export async function createCodebookHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(createCodebookSchema, request.body);
  const item = await codebookService.create(data, request.user!.id, requestIp(request));
  return reply.status(201).send(successResponse(item));
}

export async function updateCodebookHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(updateCodebookSchema, request.body);
  return reply.send(successResponse(await codebookService.update(params<{ id: string }>(request).id, data, request.user!.id, requestIp(request))));
}

export async function deleteCodebookHandler(request: FastifyRequest, reply: FastifyReply) {
  await codebookService.remove(params<{ id: string }>(request).id, request.user!.id, requestIp(request));
  return reply.status(204).send();
}
