import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      name: string;
      firstName: string;
      lastName: string;
      email: string;
      emailVerified: boolean;
      image?: string | null;
      role: "student" | "admin";
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    session?: {
      id: string;
      token: string;
      userId: string;
      expiresAt: Date;
      createdAt: Date;
      updatedAt: Date;
      ipAddress?: string | null;
      userAgent?: string | null;
    };
  }
}
