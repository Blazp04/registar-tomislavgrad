import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { z } from "zod";
import { db } from "../core/database/db.js";
import { consent, studentProfile } from "../core/database/student-schema.js";
import { user } from "../core/database/auth-schema.js";
import { env } from "../core/config/env.js";
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from "../core/config/policies.js";
import { sendSystemEmail } from "./email.js";
import * as schema from "../core/database/schema.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: env.CORS_ORIGINS,
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60,
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
        validator: { input: z.string().trim().min(1).max(100) },
      },
      lastName: {
        type: "string",
        required: true,
        validator: { input: z.string().trim().min(1).max(100) },
      },
      role: {
        type: "string",
        required: true,
        input: false,
        defaultValue: "student",
        validator: { output: z.enum(["student", "admin"]) },
      },
      isActive: {
        type: "boolean",
        required: true,
        input: false,
        defaultValue: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user: authUser, url }) {
      const person = authUser as typeof authUser & { firstName?: string; lastName?: string };
      await sendSystemEmail({
        to: authUser.email,
        firstName: String(person.firstName ?? authUser.name),
        lastName: String(person.lastName ?? ""),
        subject: "Sigurna promjena lozinke",
        messageBody: "Zaprimili smo zahtjev za promjenu lozinke. Poveznica vrijedi jedan sat. Ako zahtjev niste poslali, zanemarite ovu poruku.",
        actionLabel: "Postavi novu lozinku",
        actionUrl: url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60 * 24,
    async sendVerificationEmail({ user: authUser, url }) {
      const person = authUser as typeof authUser & { firstName?: string; lastName?: string };
      await sendSystemEmail({
        to: authUser.email,
        firstName: String(person.firstName ?? authUser.name),
        lastName: String(person.lastName ?? ""),
        subject: "Potvrdite e-mail adresu",
        messageBody: "Potvrdite e-mail adresu kako biste mogli pristupiti Registru studenata i stipendija.",
        actionLabel: "Potvrdi e-mail",
        actionUrl: url,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(_createdUser, context) {
          const body = (context?.body ?? {}) as Record<string, unknown>;
          if (body.termsAccepted !== true || body.privacyAccepted !== true) return false;
        },
        async after(createdUser, context) {
          if (createdUser.role !== "student") return;
          const body = (context?.body ?? {}) as Record<string, unknown>;
          const ipAddress = context?.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            ?? context?.request?.headers.get("x-real-ip")
            ?? null;

          await db.insert(studentProfile).values({ userId: createdUser.id }).onConflictDoNothing();
          await db.insert(consent).values([
            {
              userId: createdUser.id,
              type: "terms",
              version: typeof body.termsVersion === "string" ? body.termsVersion : TERMS_VERSION,
              accepted: body.termsAccepted === true,
              ipAddress,
            },
            {
              userId: createdUser.id,
              type: "privacy",
              version: typeof body.privacyVersion === "string" ? body.privacyVersion : PRIVACY_POLICY_VERSION,
              accepted: body.privacyAccepted === true,
              ipAddress,
            },
          ]);
        },
      },
    },
    session: {
      create: {
        async before(newSession) {
          const [accountOwner] = await db
            .select({ isActive: user.isActive })
            .from(user)
            .where(eq(user.id, newSession.userId))
            .limit(1);
          return accountOwner?.isActive === true;
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
});
