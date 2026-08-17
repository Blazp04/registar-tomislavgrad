import type { FastifyInstance } from "fastify";
import { adminPreHandler, studentPreHandler } from "../core/middleware/authMiddleware.js";
import {
  adminCreateEducationHandler,
  adminDeleteEducationHandler,
  adminUpdateEducationHandler,
  adminUpdateProfileHandler,
  confirmOwnProfileHandler,
  createOwnDataRequestHandler,
  createOwnEducationHandler,
  createScholarshipHandler,
  deactivateOwnAccountHandler,
  deleteOwnEducationHandler,
  deleteScholarshipHandler,
  exportOwnDataHandler,
  exportStudentsHandler,
  getAuditLogsHandler,
  getDataRequestsHandler,
  getOwnProfileHandler,
  getStudentDashboardHandler,
  getStudentHandler,
  getStudentStatsHandler,
  getStudentsHandler,
  recordOwnConsentHandler,
  resolveDataRequestHandler,
  updateAccountStatusHandler,
  updateOwnEducationHandler,
  updateOwnProfileHandler,
  updateScholarshipHandler,
  verifyStudentHandler,
} from "../handlers/studentHandler.js";

export function registerStudentRoutes(fastify: FastifyInstance) {
  const studentOnly = { preHandler: [studentPreHandler] };
  fastify.get("/api/dashboard", studentOnly, getStudentDashboardHandler);
  fastify.get("/api/profile", studentOnly, getOwnProfileHandler);
  fastify.put("/api/profile", studentOnly, updateOwnProfileHandler);
  fastify.post("/api/profile/educations", studentOnly, createOwnEducationHandler);
  fastify.put("/api/profile/educations/:id", studentOnly, updateOwnEducationHandler);
  fastify.delete("/api/profile/educations/:id", studentOnly, deleteOwnEducationHandler);
  fastify.post("/api/profile/confirm", studentOnly, confirmOwnProfileHandler);
  fastify.post("/api/profile/consents", studentOnly, recordOwnConsentHandler);
  fastify.post("/api/profile/data-requests", studentOnly, createOwnDataRequestHandler);
  fastify.get("/api/profile/export", studentOnly, exportOwnDataHandler);
  fastify.post("/api/account/deactivate", studentOnly, deactivateOwnAccountHandler);

  const adminOnly = { preHandler: [adminPreHandler] };
  fastify.get("/api/admin/students/stats", adminOnly, getStudentStatsHandler);
  fastify.get("/api/admin/students/export", adminOnly, exportStudentsHandler);
  fastify.get("/api/admin/students", adminOnly, getStudentsHandler);
  fastify.get("/api/admin/students/:profileId", adminOnly, getStudentHandler);
  fastify.put("/api/admin/students/:profileId/profile", adminOnly, adminUpdateProfileHandler);
  fastify.post("/api/admin/students/:profileId/educations", adminOnly, adminCreateEducationHandler);
  fastify.put("/api/admin/students/:profileId/educations/:id", adminOnly, adminUpdateEducationHandler);
  fastify.delete("/api/admin/students/:profileId/educations/:id", adminOnly, adminDeleteEducationHandler);
  fastify.post("/api/admin/students/:profileId/verify", adminOnly, verifyStudentHandler);
  fastify.put("/api/admin/students/:profileId/account-status", adminOnly, updateAccountStatusHandler);
  fastify.post("/api/admin/students/:profileId/scholarships", adminOnly, createScholarshipHandler);
  fastify.put("/api/admin/scholarships/:id", adminOnly, updateScholarshipHandler);
  fastify.delete("/api/admin/scholarships/:id", adminOnly, deleteScholarshipHandler);
  fastify.get("/api/admin/data-requests", adminOnly, getDataRequestsHandler);
  fastify.put("/api/admin/data-requests/:id", adminOnly, resolveDataRequestHandler);
  fastify.get("/api/admin/audit-logs", adminOnly, getAuditLogsHandler);
}
