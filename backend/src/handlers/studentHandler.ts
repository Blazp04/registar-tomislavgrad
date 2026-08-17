import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  accountStatusSchema,
  consentSchema,
  dataRequestResolutionSchema,
  dataRequestSchema,
  educationSchema,
  profileVerificationSchema,
  scholarshipSchema,
  studentQuerySchema,
  updateProfileSchema,
} from "../dto/student.js";
import { studentService } from "../core/services/studentService.js";
import { successResponse } from "../core/utils/response.js";
import { parseWithSchema } from "../core/utils/validation.js";

const ip = (request: FastifyRequest) => request.ip;
const params = <T>(request: FastifyRequest) => request.params as T;

export async function getOwnProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.send(successResponse(await studentService.getOwnBundle(request.user!.id)));
}

export async function getStudentDashboardHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.send(successResponse(await studentService.getOwnDashboard(request.user!.id)));
}

export async function updateOwnProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(updateProfileSchema, request.body);
  return reply.send(successResponse(await studentService.updateOwnProfile(request.user!.id, data)));
}

export async function createOwnEducationHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(educationSchema, request.body);
  return reply.status(201).send(successResponse(await studentService.createEducation(request.user!.id, data)));
}

export async function updateOwnEducationHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(educationSchema, request.body);
  return reply.send(successResponse(await studentService.updateEducation(request.user!.id, params<{ id: string }>(request).id, data)));
}

export async function deleteOwnEducationHandler(request: FastifyRequest, reply: FastifyReply) {
  await studentService.deleteEducation(request.user!.id, params<{ id: string }>(request).id);
  return reply.status(204).send();
}

export async function confirmOwnProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.send(successResponse(await studentService.confirmOwnProfile(request.user!.id)));
}

export async function recordOwnConsentHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(consentSchema, request.body);
  return reply.status(201).send(successResponse(await studentService.recordConsent(request.user!.id, data, ip(request))));
}

export async function createOwnDataRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(dataRequestSchema, request.body);
  return reply.status(201).send(successResponse(await studentService.createDataRequest(request.user!.id, request.user!.email, data)));
}

export async function exportOwnDataHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = await studentService.exportOwnData(request.user!.id);
  reply.header("Content-Disposition", `attachment; filename="moji-podaci-${new Date().toISOString().slice(0, 10)}.json"`);
  return reply.type("application/json; charset=utf-8").send(data);
}

export async function deactivateOwnAccountHandler(request: FastifyRequest, reply: FastifyReply) {
  await studentService.deactivateOwnAccount(request.user!.id, ip(request));
  return reply.status(204).send();
}

export async function getStudentsHandler(request: FastifyRequest, reply: FastifyReply) {
  const filters = parseWithSchema(studentQuerySchema, request.query);
  const result = await studentService.listStudents(filters);
  return reply.send(successResponse(result.items, result.meta));
}

export async function getStudentHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.send(successResponse(await studentService.getAdminStudent(params<{ profileId: string }>(request).profileId)));
}

export async function getStudentStatsHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(successResponse(await studentService.getStats()));
}

export async function exportStudentsHandler(request: FastifyRequest, reply: FastifyReply) {
  const filters = parseWithSchema(studentQuerySchema, request.query);
  const csv = await studentService.exportFilteredStudents(filters);
  reply.header("Content-Disposition", `attachment; filename="studenti-${new Date().toISOString().slice(0, 10)}.csv"`);
  return reply.type("text/csv; charset=utf-8").send(csv);
}

export async function verifyStudentHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(profileVerificationSchema, request.body);
  return reply.send(successResponse(await studentService.verifyStudent(params<{ profileId: string }>(request).profileId, data.academicYear, request.user!.id, ip(request))));
}

export async function adminUpdateProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(updateProfileSchema, request.body);
  return reply.send(successResponse(await studentService.adminUpdateProfile(params<{ profileId: string }>(request).profileId, data, request.user!.id, ip(request))));
}

export async function adminCreateEducationHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(educationSchema, request.body);
  return reply.status(201).send(successResponse(await studentService.adminCreateEducation(params<{ profileId: string }>(request).profileId, data, request.user!.id, ip(request))));
}

export async function adminUpdateEducationHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(educationSchema, request.body);
  const route = params<{ profileId: string; id: string }>(request);
  return reply.send(successResponse(await studentService.adminUpdateEducation(route.profileId, route.id, data, request.user!.id, ip(request))));
}

export async function adminDeleteEducationHandler(request: FastifyRequest, reply: FastifyReply) {
  const route = params<{ profileId: string; id: string }>(request);
  await studentService.adminDeleteEducation(route.profileId, route.id, request.user!.id, ip(request));
  return reply.status(204).send();
}

export async function createScholarshipHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(scholarshipSchema, request.body);
  return reply.status(201).send(successResponse(await studentService.createScholarship(params<{ profileId: string }>(request).profileId, data, request.user!.id, ip(request))));
}

export async function updateScholarshipHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(scholarshipSchema, request.body);
  return reply.send(successResponse(await studentService.updateScholarship(params<{ id: string }>(request).id, data, request.user!.id, ip(request))));
}

export async function deleteScholarshipHandler(request: FastifyRequest, reply: FastifyReply) {
  await studentService.deleteScholarship(params<{ id: string }>(request).id, request.user!.id, ip(request));
  return reply.status(204).send();
}

export async function getDataRequestsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = parseWithSchema(z.object({ status: z.enum(["submitted", "in_review", "completed", "rejected"]).optional() }), request.query);
  return reply.send(successResponse(await studentService.listDataRequests(query.status)));
}

export async function resolveDataRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(dataRequestResolutionSchema, request.body);
  return reply.send(successResponse(await studentService.resolveDataRequest(params<{ id: string }>(request).id, data, request.user!.id, ip(request))));
}

export async function updateAccountStatusHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = parseWithSchema(accountStatusSchema, request.body);
  return reply.send(successResponse(await studentService.updateAccountStatus(params<{ profileId: string }>(request).profileId, data.isActive, request.user!.id, ip(request))));
}

export async function getAuditLogsHandler(request: FastifyRequest, reply: FastifyReply) {
  const query = parseWithSchema(z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(30),
    subjectUserId: z.string().uuid().optional(),
  }), request.query);
  const result = await studentService.listAuditLogs(query.page, query.limit, query.subjectUserId);
  return reply.send(successResponse(result.items, result.meta));
}
