import type { FastifyRequest, FastifyReply } from "fastify";
import { studentService } from "../core/services/studentService.js";
import { successResponse } from "../core/utils/response.js";
import { ValidationError } from "../core/utils/errors.js";
import { createStudentSchema, updateStudentSchema, studentQuerySchema, sendSmsSchema, sendEmailSchema, type CreateStudentDTO, type UpdateStudentDTO, type SendSmsDTO, type SendEmailDTO } from "../dto/student.js";
import { z } from "zod";

export async function getStudentsHandler(
  request: FastifyRequest<{ Querystring: Record<string, string> }>,
  reply: FastifyReply
) {
  const filters = studentQuerySchema.parse(request.query);
  const result = await studentService.getAll(filters);
  return reply.send(successResponse(result.items, result.meta));
}

export async function getStudentHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const student = await studentService.getById(request.params.id);
  return reply.send(successResponse(student));
}

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

export async function createStudentHandler(
  request: FastifyRequest<{ Body: CreateStudentDTO }>,
  reply: FastifyReply
) {
  const parsed = createStudentSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError("Validacija nije uspjela", formatZodErrors(parsed.error));
  }
  const student = await studentService.create(parsed.data);
  return reply.status(201).send(successResponse(student));
}

export async function updateStudentHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateStudentDTO }>,
  reply: FastifyReply
) {
  const parsed = updateStudentSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError("Validacija nije uspjela", formatZodErrors(parsed.error));
  }
  const userId = (request as any).user?.id;
  const student = await studentService.update(request.params.id, parsed.data, userId);
  return reply.send(successResponse(student));
}

export async function deleteStudentHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = (request as any).user?.id;
  await studentService.remove(request.params.id, userId);
  return reply.status(204).send();
}

export async function getStudentStatsHandler(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const stats = await studentService.getStats();
  return reply.send(successResponse(stats));
}

export async function sendBulkSmsHandler(
  request: FastifyRequest<{ Body: SendSmsDTO }>,
  reply: FastifyReply
) {
  const parsed = sendSmsSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError("Validacija nije uspjela", formatZodErrors(parsed.error));
  }
  const result = await studentService.sendBulkSms(parsed.data);
  return reply.send(successResponse(result));
}

export async function sendBulkEmailHandler(
  request: FastifyRequest<{ Body: SendEmailDTO }>,
  reply: FastifyReply
) {
  const parsed = sendEmailSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ValidationError("Validacija nije uspjela", formatZodErrors(parsed.error));
  }
  const result = await studentService.sendBulkEmail(parsed.data);
  return reply.send(successResponse(result));
}
