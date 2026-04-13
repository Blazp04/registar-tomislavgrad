import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../../lib/auth.js";
import { UnauthorizedError } from "../utils/errors.js";

export async function authPreHandler(request: FastifyRequest, _reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: request.headers as unknown as Headers,
  });

  if (!session) {
    throw new UnauthorizedError("Potrebna je prijava");
  }

  (request as any).user = session.user;
  (request as any).session = session.session;
}
