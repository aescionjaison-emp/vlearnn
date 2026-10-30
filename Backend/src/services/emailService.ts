import { Resend } from "resend";
import { env } from "../config/env";
import { firestoreService } from "./firestoreService";
import { MessageStatus, MessageChannel } from "../types/models";

/**
 * Escapes user-supplied content to prevent HTML injection in email templates.
 */
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Lazily gets or initializes the Resend client using current environment variables.
 */
function getResendClient(): Resend | null {
  const apiKey = (process.env.RESEND_API_KEY || env.RESEND_API_KEY || "").trim();
  if (!apiKey || !apiKey.startsWith("re_")) {
    return null;
  }
  return new Resend(apiKey);
}

export interface SendAdminNotificationParams {
  enquiryId: string;
  enquiryNumber: string;
  fullName: string;
  email: string;
  phone: string;
  courseTitle?: string | null;
  learningMode?: string | null;
  message: string;
}

/**
 * Safely creates an EmailNotification record in Firestore.
 */
async function safelyCreateEmailNotification(data: {
  enquiryId: string;
  recipient: string;
  subject: string;
  status: MessageStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
}) {
  try {
    return await firestoreService.addEmailNotification(data);
  } catch (err: any) {
    console.error("Failed to persist email notification log:", err);
    return null;
  }
}

/**
 * Safely creates an EnquiryMessage record in Firestore.
 */
async function safelyCreateEnquiryMessage(data: {
  enquiryId: string;
  senderRole: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  channel: MessageChannel;
  status: MessageStatus;
  providerMessageId?: string | null;
}) {
  try {
    return await firestoreService.addEnquiryMessage(data);
  } catch (err: any) {
    console.error("Failed to persist enquiry message log:", err);
    return null;
  }
}

/**
 * Dispatches an email notification to the administrator when a student submits an enquiry.
 * Idempotent: Skips dispatch if this enquiry was already notified with status SENT.
 */
export async function sendAdminEnquiryNotification(params: SendAdminNotificationParams) {
  const subject = `[New VLEARNN Enquiry] ${params.enquiryNumber} - ${params.fullName} (${params.courseTitle || "General Enquiry"})`;

  // Idempotency check: avoid duplicate dispatches if requests are retried
  const alreadySent = await firestoreService.hasSentEmailNotification(params.enquiryId);

  if (alreadySent) {
    console.log(
      `[Email Notification Idempotent] Notification already dispatched for ${params.enquiryNumber}.`
    );
    return {
      success: true,
      status: MessageStatus.SENT,
      alreadyDispatched: true,
    };
  }

  const safeName = escapeHtml(params.fullName);
  const safeEmail = escapeHtml(params.email);
  const safePhone = escapeHtml(params.phone);
  const safeCourse = escapeHtml(params.courseTitle || "General IT Training Enquiry");
  const safeMode = escapeHtml(params.learningMode || "Flexible / Not Specified");
  const safeMessage = escapeHtml(params.message);

  const textContent = `
A new student enquiry has been submitted on the VLEARNN website.

Enquiry ID: ${params.enquiryNumber}
Student Name: ${params.fullName}
Email: ${params.email}
Phone: ${params.phone}
Course: ${params.courseTitle || "General Enquiry"}
Learning Mode: ${params.learningMode || "Not Specified"}
Submission Time: ${new Date().toLocaleString()}

Student Message:
${params.message}

---
You can view and reply to this lead from the VLEARNN Admin Dashboard.
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #172B4D; line-height: 1.6; }
    .header { background: #172B4D; color: #ffffff; padding: 20px; border-radius: 6px 6px 0 0; }
    .content { border: 1px solid #E5E9F0; border-top: none; padding: 24px; border-radius: 0 0 6px 6px; }
    .badge { display: inline-block; background: #C88B3A; color: #ffffff; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
    .field { margin-bottom: 12px; }
    .field-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #496A8A; font-weight: 600; }
    .field-val { font-size: 15px; color: #172B4D; font-weight: 500; }
    .msg-box { background: #F7F6F2; border-left: 4px solid #C88B3A; padding: 12px 16px; margin-top: 16px; font-style: italic; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px 0;">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px;">New Student Enquiry Received</h2>
      <p style="margin: 4px 0 0 0; opacity: 0.85; font-size: 14px;">VLEARNN Admissions Desk</p>
    </div>
    <div class="content">
      <div style="margin-bottom: 20px;">
        <span class="badge">${params.enquiryNumber}</span>
      </div>
      <div class="field">
        <div class="field-label">Student Name</div>
        <div class="field-val">${safeName}</div>
      </div>
      <div class="field">
        <div class="field-label">Contact Details</div>
        <div class="field-val">${safeEmail} | ${safePhone}</div>
      </div>
      <div class="field">
        <div class="field-label">Requested Course</div>
        <div class="field-val">${safeCourse}</div>
      </div>
      <div class="field">
        <div class="field-label">Preferred Learning Mode</div>
        <div class="field-val">${safeMode}</div>
      </div>
      <div class="field">
        <div class="field-label">Message</div>
        <div class="msg-box">${safeMessage}</div>
      </div>
    </div>
  </div>
</body>
</html>
`.trim();

  const resend = getResendClient();

  if (!resend) {
    console.warn(
      `[Email Notification Skipped] Resend API key is not configured. Enquiry ${params.enquiryNumber} saved safely to PostgreSQL.`
    );

    await safelyCreateEmailNotification({
      enquiryId: params.enquiryId,
      recipient: env.ADMIN_NOTIFICATION_EMAIL,
      subject,
      status: MessageStatus.SKIPPED,
      errorMessage: "RESEND_API_KEY is not configured. Email notification skipped gracefully.",
    });

    return {
      success: true,
      status: MessageStatus.SKIPPED,
      message: "Resend API key not configured; enquiry preserved safely in database.",
    };
  }

  try {
    const fromAddress = env.EMAIL_FROM || "VLEARNN Admissions <onboarding@resend.dev>";
    const toAddress = env.ADMIN_NOTIFICATION_EMAIL;

    const response = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject,
      text: textContent,
      html: htmlContent,
    });

    // Check for provider-level rejection
    if (response.error) {
      console.error(
        `[Email Notification Error for ${params.enquiryNumber}]: Provider rejected: ${response.error.message}`
      );

      await safelyCreateEmailNotification({
        enquiryId: params.enquiryId,
        recipient: toAddress,
        subject,
        status: MessageStatus.FAILED,
        errorMessage: response.error.message || "Resend API rejected email dispatch",
      });

      return {
        success: false,
        status: MessageStatus.FAILED,
        error: response.error.message,
      };
    }

    const providerMessageId = response.data?.id || null;

    await safelyCreateEmailNotification({
      enquiryId: params.enquiryId,
      recipient: toAddress,
      subject,
      status: MessageStatus.SENT,
      providerMessageId,
    });

    return {
      success: true,
      status: MessageStatus.SENT,
      providerMessageId,
    };
  } catch (error: any) {
    console.error(
      `[Email Notification Exception for ${params.enquiryNumber}]:`,
      error?.message || error
    );

    await safelyCreateEmailNotification({
      enquiryId: params.enquiryId,
      recipient: env.ADMIN_NOTIFICATION_EMAIL,
      subject,
      status: MessageStatus.FAILED,
      errorMessage: error?.message || "Unexpected exception during Resend dispatch",
    });

    // We do NOT throw so that the student enquiry remains safely persisted in PostgreSQL!
    return {
      success: false,
      status: MessageStatus.FAILED,
      error: error?.message || "Failed to dispatch email",
    };
  }
}

export interface SendStudentReplyParams {
  enquiryId: string;
  recipientEmail: string;
  senderEmail: string;
  subject: string;
  body: string;
}

/**
 * Dispatches an email response from an authorized administrator directly to a prospective student.
 * Never includes internal counselor notes unless explicitly typed into the message body.
 */
export async function sendStudentReplyEmail(params: SendStudentReplyParams) {
  const safeBody = escapeHtml(params.body);
  const fromAddress = env.EMAIL_FROM || "VLEARNN Admissions <onboarding@resend.dev>";
  const adminEmail = env.ADMIN_NOTIFICATION_EMAIL;

  const resend = getResendClient();

  if (!resend) {
    console.warn(
      `[Student Reply Simulated] Resend API key is not configured. Message logged in database.`
    );

    const messageRecord = await safelyCreateEnquiryMessage({
      enquiryId: params.enquiryId,
      senderRole: "ADMIN",
      senderEmail: params.senderEmail || adminEmail,
      recipientEmail: params.recipientEmail,
      subject: params.subject,
      body: params.body,
      channel: MessageChannel.EMAIL,
      status: MessageStatus.SKIPPED,
    });

    return {
      success: true,
      status: MessageStatus.SKIPPED,
      messageRecord,
      note: "Email simulated: Resend API key not configured. Message stored in database history.",
    };
  }

  try {
    const response = await resend.emails.send({
      from: fromAddress,
      to: [params.recipientEmail],
      replyTo: adminEmail,
      subject: params.subject,
      text: params.body,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #172B4D; line-height: 1.6; max-width: 600px;">
          <div style="border-bottom: 2px solid #172B4D; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #172B4D; margin: 0; font-size: 20px;">VLEARNN Institute</h2>
            <p style="color: #496A8A; margin: 4px 0 0 0; font-size: 13px;">Practical IT & Advanced Technical Training</p>
          </div>
          <div style="white-space: pre-wrap; font-size: 15px; color: #172B4D;">${safeBody}</div>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E9F0; font-size: 12px; color: #496A8A;">
            <p style="margin: 0;"><strong>VLEARNN Admissions & Academic Desk</strong></p>
            <p style="margin: 4px 0 0 0;">Email: ${escapeHtml(adminEmail)} | Web: https://vlearnn.com</p>
          </div>
        </div>
      `,
    });

    if (response.error) {
      console.error(`[Student Reply Email Error]: Provider rejected: ${response.error.message}`);

      let userFriendlyError = response.error.message;
      if (response.error.message.includes("testing emails to your own email")) {
        userFriendlyError = `Resend Free/Testing Tier Restriction: Emails from 'onboarding@resend.dev' can only be delivered to your registered Resend account email (${adminEmail}). To deliver replies to student addresses (${params.recipientEmail}), please verify your custom domain in the Resend dashboard (https://resend.com/domains).`;
      }

      const messageRecord = await safelyCreateEnquiryMessage({
        enquiryId: params.enquiryId,
        senderRole: "ADMIN",
        senderEmail: params.senderEmail || adminEmail,
        recipientEmail: params.recipientEmail,
        subject: params.subject,
        body: params.body,
        channel: MessageChannel.EMAIL,
        status: MessageStatus.FAILED,
      });

      return {
        success: false,
        status: MessageStatus.FAILED,
        error: userFriendlyError,
        messageRecord,
      };
    }

    const providerMessageId = response.data?.id || null;

    const messageRecord = await safelyCreateEnquiryMessage({
      enquiryId: params.enquiryId,
      senderRole: "ADMIN",
      senderEmail: params.senderEmail || adminEmail,
      recipientEmail: params.recipientEmail,
      subject: params.subject,
      body: params.body,
      channel: MessageChannel.EMAIL,
      status: MessageStatus.SENT,
      providerMessageId,
    });

    return {
      success: true,
      status: MessageStatus.SENT,
      providerMessageId,
      messageRecord,
    };
  } catch (error: any) {
    console.error(`[Student Reply Email Exception]:`, error?.message || error);

    const messageRecord = await safelyCreateEnquiryMessage({
      enquiryId: params.enquiryId,
      senderRole: "ADMIN",
      senderEmail: params.senderEmail || adminEmail,
      recipientEmail: params.recipientEmail,
      subject: params.subject,
      body: params.body,
      channel: MessageChannel.EMAIL,
      status: MessageStatus.FAILED,
    });

    return {
      success: false,
      status: MessageStatus.FAILED,
      error: error?.message || "Failed to dispatch email reply",
      messageRecord,
    };
  }
}
