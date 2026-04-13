import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { env } from "../core/config/env.js";
import { StudentEmail } from "../emails/student-email.js";

const isEmailConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  firstName: string;
  lastName: string;
  messageBody: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const html = await render(
    StudentEmail({
      firstName: options.firstName,
      lastName: options.lastName,
      messageBody: options.messageBody,
      subject: options.subject,
    })
  );

  if (!transporter) {
    // Dev fallback — log to console
    console.log("=== EMAIL (dev mode — SMTP not configured) ===");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`HTML length: ${html.length} chars`);
    console.log("Preview body:", options.messageBody);
    console.log("=== END EMAIL ===\n");
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

export function isEmailEnabled() {
  return isEmailConfigured;
}
