const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const gmailEmail = defineSecret("GMAIL_EMAIL");
const gmailPassword = defineSecret("GMAIL_APP_PASSWORD");

function formatFeedbackEmail(data) {
  const category = data.category || "General";
  const message = data.message || "(No message provided)";
  const userEmail = data.userEmail || "Anonymous";
  const userName = data.userName || "Unknown";
  const status = data.status || "new";
  const page = data.page || "/";
  const userAgent = data.userAgent || "Not provided";
  const createdAt = data.createdAt
    ? data.createdAt.toDate
      ? data.createdAt.toDate().toLocaleString("en-CA", { timeZone: "America/Toronto" })
      : new Date(data.createdAt).toLocaleString("en-CA", { timeZone: "America/Toronto" })
    : new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" });

  const subject = `[BillPort Feedback] ${category} – from ${userEmail}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e293b; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; font-size: 20px; margin: 0;">
          <span style="color: #2dd4bf;">BillPort</span> – New Feedback
        </h1>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; width: 120px; vertical-align: top;">Category</td>
            <td style="padding: 8px 12px; color: #1e293b;">
              <span style="background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 500;">${category}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; vertical-align: top;">From</td>
            <td style="padding: 8px 12px; color: #1e293b;">${userName} &lt;${userEmail}&gt;</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; vertical-align: top;">Date</td>
            <td style="padding: 8px 12px; color: #1e293b;">${createdAt}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; vertical-align: top;">Status</td>
            <td style="padding: 8px 12px; color: #1e293b;">
              <span style="background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 500;">${status}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #475569; vertical-align: top;">Page</td>
            <td style="padding: 8px 12px; color: #1e293b; font-family: monospace; font-size: 13px;">${page}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 16px 12px 8px;">
              <div style="font-weight: 600; color: #475569; margin-bottom: 8px;">Message</div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 16px 12px 4px;">
              <details style="cursor: pointer;">
                <summary style="font-weight: 600; color: #94a3b8; font-size: 12px;">User Agent</summary>
                <p style="color: #94a3b8; font-size: 11px; margin-top: 4px; word-break: break-all;">${userAgent}</p>
              </details>
            </td>
          </tr>
        </table>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
        Sent automatically by MyBillPort Cloud Functions
      </p>
    </div>
  `;

  return { subject, html };
}

exports.sendFeedbackEmail = onDocumentCreated(
  {
    document: "feedback/{feedbackId}",
    secrets: [gmailEmail, gmailPassword],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.error("No data in feedback document");
      return;
    }

    const data = snapshot.data();
    console.log("New feedback received:", {
      category: data.category,
      userEmail: data.userEmail,
      page: data.page,
      feedbackId: event.params.feedbackId,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailEmail.value(),
        pass: gmailPassword.value(),
      },
    });

    const { subject, html } = formatFeedbackEmail(data);

    const mailOptions = {
      from: `"BillPort Feedback" <${gmailEmail.value()}>`,
      to: "mybillportinfo@gmail.com",
      replyTo: data.userEmail || undefined,
      subject,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Feedback email sent successfully for:", event.params.feedbackId);
    } catch (error) {
      console.error("Failed to send feedback email:", error);
      throw error;
    }
  }
);
