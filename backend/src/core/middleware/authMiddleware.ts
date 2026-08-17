import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../../lib/auth.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

export async function authPreHandler(request: FastifyRequest, _reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: request.headers as unknown as Headers,
  });

  if (!session?.user) throw new UnauthorizedError("Potrebna je prijava");

  const sessionUser = session.user as typeof session.user & {
    firstName: string;
    lastName: string;
    role: "student" | "admin";
    isActive: boolean;
  };

  if (!sessionUser.isActive) throw new ForbiddenError("Korisnički račun je deaktiviran");
  request.user = sessionUser;
  request.session = session.session;
}

export async function studentPreHandler(request: FastifyRequest, reply: FastifyReply) {
  await authPreHandler(request, reply);
  if (request.user?.role !== "student") throw new ForbiddenError("Ruta je dostupna samo studentima");
}

export async function adminPreHandler(request: FastifyRequest, reply: FastifyReply) {
  await authPreHandler(request, reply);
  if (request.user?.role !== "admin") throw new ForbiddenError("Potrebne su administratorske ovlasti");
}
