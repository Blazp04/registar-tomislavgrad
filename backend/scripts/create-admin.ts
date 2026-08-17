import { eq } from "drizzle-orm";
import { auth } from "../src/lib/auth.js";
import { db } from "../src/core/database/db.js";
import { user } from "../src/core/database/auth-schema.js";
import { consent, studentProfile } from "../src/core/database/student-schema.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const firstName = process.env.ADMIN_FIRST_NAME?.trim() || "Administrator";
const lastName = process.env.ADMIN_LAST_NAME?.trim() || "Registra";

if (!email || !password || password.length < 12) {
  throw new Error("Postavite ADMIN_EMAIL i ADMIN_PASSWORD (najmanje 12 znakova). Opcionalno postavite ADMIN_FIRST_NAME i ADMIN_LAST_NAME.");
}

const signUpBody = {
  email,
  password,
  name: `${firstName} ${lastName}`,
  firstName,
  lastName,
  termsAccepted: true,
  privacyAccepted: true,
} satisfies NonNullable<Parameters<typeof auth.api.signUpEmail>[0]>["body"] & {
  termsAccepted: boolean;
  privacyAccepted: boolean;
};

const result = await auth.api.signUpEmail({ body: signUpBody });

await db.transaction(async (tx) => {
  await tx.update(user).set({ role: "admin", emailVerified: true }).where(eq(user.id, result.user.id));
  const [profile] = await tx.select({ id: studentProfile.id }).from(studentProfile).where(eq(studentProfile.userId, result.user.id)).limit(1);
  if (profile) await tx.delete(studentProfile).where(eq(studentProfile.id, profile.id));
  await tx.delete(consent).where(eq(consent.userId, result.user.id));
});

console.log(`Administratorski račun ${email} je kreiran i potvrđen.`);
process.exit(0);
