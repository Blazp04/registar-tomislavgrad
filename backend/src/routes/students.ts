import type { FastifyInstance } from "fastify";
import { authPreHandler } from "../core/middleware/authMiddleware.js";
import {
  getStudentsHandler,
  getStudentHandler,
  createStudentHandler,
  updateStudentHandler,
  deleteStudentHandler,
  getStudentStatsHandler,
  sendBulkSmsHandler,
  sendBulkEmailHandler,
} from "../handlers/studentHandler.js";
import { getStudentNotificationsHandler } from "../handlers/notificationHandler.js";

const studentItemSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    fatherName: { type: "string" },
    email: { type: "string" },
    address: { type: "string" },
    phone: { type: "string" },
    isCurrentStudent: { type: "boolean" },
    isEmployed: { type: "boolean" },
    isWorkingInField: { type: "boolean" },
    highSchoolType: { type: "string", enum: ["gimnazija", "strukovna"] },
    highSchoolDuration: { type: "string", enum: ["trogodisnja", "cetverogodisnja", "petogodisnja"] },
    highSchoolProfessionId: { type: "string", nullable: true },
    highSchoolCityId: { type: "string" },
    highSchoolProfessionName: { type: "string", nullable: true },
    highSchoolCityName: { type: "string" },
    facultyId: { type: "string" },
    fieldOfStudyId: { type: "string" },
    facultyCityId: { type: "string" },
    facultyName: { type: "string" },
    fieldOfStudyName: { type: "string" },
    facultyCityName: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const paginationMetaSchema = {
  type: "object",
  properties: {
    page: { type: "number" },
    limit: { type: "number" },
    total: { type: "number" },
    totalPages: { type: "number" },
    hasNextPage: { type: "boolean" },
    hasPreviousPage: { type: "boolean" },
  },
};

const statsSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      properties: {
        total: { type: "number" },
        currentStudents: { type: "number" },
        formerStudents: { type: "number" },
        employed: { type: "number" },
        unemployed: { type: "number" },
        workingInField: { type: "number" },
        notWorkingInField: { type: "number" },
        byFaculty: {
          type: "array",
          items: {
            type: "object",
            properties: {
              facultyId: { type: "string" },
              facultyName: { type: "string" },
              count: { type: "number" },
            },
          },
        },
        byFieldOfStudy: {
          type: "array",
          items: {
            type: "object",
            properties: {
              fieldOfStudyId: { type: "string" },
              fieldOfStudyName: { type: "string" },
              count: { type: "number" },
            },
          },
        },
      },
    },
  },
};

const smsResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      properties: {
        sent: { type: "number" },
        messages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phone: { type: "string" },
              studentName: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },
};

export function registerStudentRoutes(fastify: FastifyInstance) {
  // Admin — list students with filtering and pagination
  fastify.route({
    method: "GET",
    url: "/api/students",
    schema: {
      description: "List all students with filters",
      tags: ["Students"],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          search: { type: "string" },
          facultyId: { type: "string" },
          fieldOfStudyId: { type: "string" },
          isCurrentStudent: { type: "string", enum: ["true", "false"] },
          isEmployed: { type: "string", enum: ["true", "false"] },
          isWorkingInField: { type: "string", enum: ["true", "false"] },
          page: { type: "string", default: "1" },
          limit: { type: "string", default: "20" },
          sort: { type: "string", enum: ["lastName", "firstName", "facultyName", "fieldOfStudyName", "createdAt"] },
          order: { type: "string", enum: ["asc", "desc"], default: "asc" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "array", items: studentItemSchema },
            meta: paginationMetaSchema,
          },
        },
      },
    },
    preHandler: [authPreHandler],
    handler: getStudentsHandler,
  });

  // Admin — get student by ID
  fastify.route({
    method: "GET",
    url: "/api/students/:id",
    schema: {
      description: "Get student by ID",
      tags: ["Students"],
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: studentItemSchema,
          },
        },
      },
    },
    preHandler: [authPreHandler],
    handler: getStudentHandler,
  });

  // Public — submit student registration
  fastify.route({
    method: "POST",
    url: "/api/students",
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute",
      },
    },
    schema: {
      description: "Register as a student (public form)",
      tags: ["Students"],
      body: {
        type: "object",
        properties: {
          firstName: { type: "string", minLength: 1 },
          lastName: { type: "string", minLength: 1 },
          fatherName: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
          address: { type: "string", minLength: 1 },
          phone: { type: "string", minLength: 6 },
          isCurrentStudent: { type: "boolean" },
          isEmployed: { type: "boolean" },
          isWorkingInField: { type: "boolean" },
          highSchoolType: { type: "string", enum: ["gimnazija", "strukovna"] },
          highSchoolDuration: { type: "string", enum: ["trogodisnja", "cetverogodisnja", "petogodisnja"] },
          highSchoolProfessionId: { type: "string" },
          highSchoolCityId: { type: "string" },
          customHighSchoolProfessionName: { type: "string" },
          customCityName: { type: "string" },
          facultyId: { type: "string" },
          fieldOfStudyId: { type: "string" },
          facultyCityId: { type: "string" },
          customFacultyName: { type: "string" },
          customFieldOfStudyName: { type: "string" },
        },
        required: ["firstName", "lastName", "fatherName", "email", "address", "phone", "isCurrentStudent", "isEmployed", "highSchoolType", "highSchoolDuration", "highSchoolCityId", "facultyId", "fieldOfStudyId", "facultyCityId"],
      },
      response: {
        201: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: studentItemSchema,
          },
        },
      },
    },
    handler: createStudentHandler,
  });

  // Admin — update student
  fastify.route({
    method: "PUT",
    url: "/api/students/:id",
    schema: {
      description: "Update student",
      tags: ["Students"],
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      body: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          fatherName: { type: "string" },
          email: { type: "string", format: "email" },
          address: { type: "string" },
          phone: { type: "string" },
          isCurrentStudent: { type: "boolean" },
          isEmployed: { type: "boolean" },
          isWorkingInField: { type: "boolean" },
          highSchoolType: { type: "string", enum: ["gimnazija", "strukovna"] },
          highSchoolDuration: { type: "string", enum: ["trogodisnja", "cetverogodisnja", "petogodisnja"] },
          highSchoolProfessionId: { type: "string", nullable: true },
          highSchoolCityId: { type: "string" },
          customHighSchoolProfessionName: { type: "string" },
          customCityName: { type: "string" },
          facultyId: { type: "string" },
          fieldOfStudyId: { type: "string" },
          facultyCityId: { type: "string" },
          customFacultyName: { type: "string" },
          customFieldOfStudyName: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: studentItemSchema,
          },
        },
      },
    },
    preHandler: [authPreHandler],
    handler: updateStudentHandler,
  });

  // Admin — delete student
  fastify.route({
    method: "DELETE",
    url: "/api/students/:id",
    schema: {
      description: "Delete student",
      tags: ["Students"],
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      response: { 204: { type: "null" } },
    },
    preHandler: [authPreHandler],
    handler: deleteStudentHandler,
  });

  // Admin — dashboard stats
  fastify.route({
    method: "GET",
    url: "/api/students/stats",
    schema: {
      description: "Get student statistics for dashboard",
      tags: ["Students"],
      security: [{ bearerAuth: [] }],
      response: { 200: statsSchema },
    },
    preHandler: [authPreHandler],
    handler: getStudentStatsHandler,
  });

  // Admin — bulk SMS
  fastify.route({
    method: "POST",
    url: "/api/students/sms",
    schema: {
      description: "Send bulk SMS to selected students (prints to console)",
      tags: ["Students"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          studentIds: { type: "array", items: { type: "string" } },
          messageTemplate: { type: "string", minLength: 1 },
        },
        required: ["studentIds", "messageTemplate"],
      },
      response: { 200: smsResponseSchema },
    },
    preHandler: [authPreHandler],
    handler: sendBulkSmsHandler,
  });

  // Admin — bulk email
  fastify.route({
    method: "POST",
    url: "/api/students/email",
    schema: {
      description: "Send bulk email to selected students",
      tags: ["Students"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          studentIds: { type: "array", items: { type: "string" } },
          subject: { type: "string", minLength: 1 },
          messageTemplate: { type: "string", minLength: 1 },
        },
        required: ["studentIds", "subject", "messageTemplate"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                sent: { type: "number" },
                total: { type: "number" },
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      email: { type: "string" },
                      studentName: { type: "string" },
                      success: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    preHandler: [authPreHandler],
    handler: sendBulkEmailHandler,
  });

  // Admin — get student notification history
  fastify.route({
    method: "GET",
    url: "/api/students/:id/notifications",
    schema: {
      description: "Get notification history for a student",
      tags: ["Students"],
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      querystring: {
        type: "object",
        properties: {
          page: { type: "string", default: "1" },
          limit: { type: "string", default: "20" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string", enum: ["email", "sms"] },
                  subject: { type: "string", nullable: true },
                  content: { type: "string" },
                  sentAt: { type: "string" },
                  senderName: { type: "string", nullable: true },
                },
              },
            },
            meta: paginationMetaSchema,
          },
        },
      },
    },
    preHandler: [authPreHandler],
    handler: getStudentNotificationsHandler,
  });
}
