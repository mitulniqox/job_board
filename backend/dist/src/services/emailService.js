"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApplicationStatusEmail = exports.buildApplicationStatusEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
let transporter = null;
let warnedMissingEmailConfig = false;
const statusLabels = {
    Applied: "Applied",
    Shortlisted: "Shortlisted",
    Interviewed: "Interviewed",
    Rejected: "Rejected",
    Hired: "Selected",
};
const getTransporter = () => {
    console.log("env.EMAIL_USER===>", env_1.env.EMAIL_USER);
    console.log("env.EMAIL_PASS===>", env_1.env.EMAIL_PASS);
    if (!env_1.env.EMAIL_USER || !env_1.env.EMAIL_PASS) {
        if (!warnedMissingEmailConfig) {
            warnedMissingEmailConfig = true;
            // eslint-disable-next-line no-console
            console.warn("Email notifications are disabled because EMAIL_USER or EMAIL_PASS is missing.");
        }
        return null;
    }
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use SSL/TLS
            auth: {
                user: env_1.env.EMAIL_USER,
                pass: env_1.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
};
const sendEmail = async (to, subject, html) => {
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
            from: env_1.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        // eslint-disable-next-line no-console
        console.log("Email notification sent:", to, subject);
        return true;
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to send email notification", error);
        return false;
    }
};
exports.sendEmail = sendEmail;
const buildApplicationStatusEmail = ({ candidateName, jobTitle, status, }) => {
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
exports.buildApplicationStatusEmail = buildApplicationStatusEmail;
const sendApplicationStatusEmail = async (input) => {
    const { subject, html } = (0, exports.buildApplicationStatusEmail)(input);
    return (0, exports.sendEmail)(input.to, subject, html);
};
exports.sendApplicationStatusEmail = sendApplicationStatusEmail;
