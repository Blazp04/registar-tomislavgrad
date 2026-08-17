import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { env } from "../core/config/env.js";
import { StudentEmail } from "../emails/student-email.js";

const isEmailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

export interface SendSystemEmailOptions {
  to: string;
  subject: string;
  firstName?: string;
  lastName?: string;
  messageBody: string;
  actionLabel?: string;
  actionUrl?: string;
}

export async function sendSystemEmail(options: SendSystemEmailOptions): Promise<boolean> {
  const html = await render(
    StudentEmail({
      firstName: options.firstName ?? "korisniče",
      lastName: options.lastName ?? "",
      messageBody: options.messageBody,
      subject: options.subject,
      actionLabel: options.actionLabel,
      actionUrl: options.actionUrl,
    }),
  );

  if (!transporter) {
    console.log("=== EMAIL (development; SMTP is not configured) ===");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    if (options.actionUrl) console.log("A protected action link was generated.");
    console.log("=== END EMAIL ===");
    return true;
  }

  await transporter.sendMail({
    from: `"Općina Tomislavgrad" <${env.SMTP_FROM}>`,
    to: options.to,
    subject: options.subject,
    html,
  });
  return true;
}

export const isEmailEnabled = () => isEmailConfigured;
