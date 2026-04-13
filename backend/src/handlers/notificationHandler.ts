import type { FastifyRequest, FastifyReply } from "fastify";
import { notificationService } from "../core/services/notificationService.js";
import { successResponse } from "../core/utils/response.js";
import { notificationQuerySchema } from "../dto/notification.js";

export async function getStudentNotificationsHandler(
  request: FastifyRequest<{ Params: { id: string }; Querystring: Record<string, string> }>,
  reply: FastifyReply
) {
  const { page, limit } = notificationQuerySchema.parse(request.query);
  const result = await notificationService.getByStudentId(request.params.id, page, limit);
  return reply.send(successResponse(result.items, result.meta));
}
