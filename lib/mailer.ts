import { Resend } from "resend";
import { logger } from "@/lib/logger";

const KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.EMAIL_FROM ?? "Realestate <noreply@example.com>";

const resend = KEY ? new Resend(KEY) : null;

type SendArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail(args: SendArgs): Promise<void> {
  if (!resend) {
    logger.warn("Resend not configured — skipping email", {
      subject: args.subject,
    });
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
  } catch (err) {
    logger.error("Failed to send email", { err: String(err) });
  }
}

export const templates = {
  verifyEmail: (link: string) => ({
    subject: "Verify your Realestate account",
    html: `<p>Welcome! Click below to verify your email:</p>
<p><a href="${link}">Verify email</a></p>
<p>If you did not sign up, you can ignore this email.</p>`,
  }),
  passwordReset: (link: string) => ({
    subject: "Reset your Realestate password",
    html: `<p>Click below to reset your password (valid 1 hour):</p>
<p><a href="${link}">Reset password</a></p>`,
  }),
  reservationPaidBuyer: (listingTitle: string, ref: string) => ({
    subject: `Reservation confirmed: ${listingTitle}`,
    html: `<p>Your reservation deposit has been received.</p>
<p>Reference: <code>${ref}</code></p>
<p>The listing agent will contact you to schedule next steps.</p>`,
  }),
  reservationPaidAgent: (listingTitle: string, buyerName: string) => ({
    subject: `New reservation: ${listingTitle}`,
    html: `<p>${buyerName} has paid a deposit on <strong>${listingTitle}</strong>.</p>
<p>Open the dashboard to view contact details and message the buyer.</p>`,
  }),
  newMessage: (listingTitle: string, threadUrl: string) => ({
    subject: `New message about ${listingTitle}`,
    html: `<p>You have a new message about <strong>${listingTitle}</strong>.</p>
<p><a href="${threadUrl}">Open conversation</a></p>`,
  }),
  agentApproved: (businessName: string) => ({
    subject: "Your agent application is approved",
    html: `<p>Congratulations — <strong>${businessName}</strong> is now an approved agent on Realestate.</p>
<p>You can start listing properties from your agent dashboard.</p>`,
  }),
  agentRejected: (businessName: string, reason: string) => ({
    subject: "Your agent application needs changes",
    html: `<p>Your application for <strong>${businessName}</strong> was not approved.</p>
<p>Reason: ${reason}</p>
<p>You can update your application and resubmit.</p>`,
  }),
};
