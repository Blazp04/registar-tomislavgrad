import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export function registerAuthRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    schema: {
      hide: true,
    },
    async handler(request, reply) {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = fromNodeHeaders(request.headers);

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body
          ? {
              body: JSON.stringify(request.body),
              duplex: "half" as const,
            }
          : {}),
      });

      if (request.body && !headers.has("content-type")) {
        req.headers.set("content-type", "application/json");
      }

      const response = await auth.handler(req);

      reply.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") reply.header(key, value);
      });
      const cookies = response.headers.getSetCookie?.() ?? [];
      if (cookies.length > 0) reply.header("set-cookie", cookies);
      reply.send(response.body ? await response.text() : null);
    },
  });
}
