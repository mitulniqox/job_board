import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { ApplicationStatus } from "../modules/applications/application.model";

type ApplicationStatusEmailInput = {
  to: string;
  candidateName: string;
  jobTitle: string;
  status: ApplicationStatus | "Applied";
};

let transporter: Transporter | null = null;
let warnedMissingEmailConfig = false;

const statusLabels: Record<ApplicationStatus | "Applied", string> = {
  Applied: "Applied",
  Shortlisted: "Shortlisted",
  Interviewed: "Interviewed",
  Rejected: "Rejected",
  Hired: "Selected",
};

const getTransporter = (): Transporter | null => {
  console.log("env.EMAIL_USER===>", env.EMAIL_USER);
  console.log("env.EMAIL_PASS===>", env.EMAIL_PASS);
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    if (!warnedMissingEmailConfig) {
      warnedMissingEmailConfig = true;
      // eslint-disable-next-line no-console
      console.warn("Email notifications are disabled because EMAIL_USER or EMAIL_PASS is missing.");
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL/TLS
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  if (!to?.trim()) {
    // eslint-disable-next-line no-console
    console.warn("Skipping email notification because recipient email is missing.");
    return false;
  }

  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    return false;
  }

  try {
    await mailTransporter.sendMail({
      from: env.EMAIL_USER,
      to,
      subject,
      html,
    });
    // eslint-disable-next-line no-console
    console.log("Email notification sent:", to, subject);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to send email notification", error);
    return false;
  }
};

export const buildApplicationStatusEmail = ({
  candidateName,
  jobTitle,
  status,
}: Omit<ApplicationStatusEmailInput, "to">): { subject: string; html: string } => {
  const statusLabel = statusLabels[status];
  const subject = `Application update: ${jobTitle} - ${statusLabel}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 16px;">Application Status Update</h2>
      <p>Hi ${candidateName},</p>
      <p>Your application status has been updated.</p>
      <div style="margin: 20px 0; padding: 16px; background: #f3f4f6; border-radius: 8px;">
        <p style="margin: 0 0 8px;"><strong>Job Title:</strong> ${jobTitle}</p>
        <p style="margin: 0;"><strong>Status:</strong> ${statusLabel}</p>
      </div>
      <p>Please sign in to your dashboard to review the latest details.</p>
      <p>Regards,<br />IBL Finance Team</p>
    </div>
  `;

  return { subject, html };
};

export const sendApplicationStatusEmail = async (
  input: ApplicationStatusEmailInput
): Promise<boolean> => {
  const { subject, html } = buildApplicationStatusEmail(input);
  return sendEmail(input.to, subject, html);
};
