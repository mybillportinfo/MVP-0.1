import type { Express } from "express";

export function registerEmailTestRoutes(app: Express) {
  // Email test endpoint
  app.post("/api/email-test", async (req, res) => {
    try {
      const testEmail = process.env.TEST_EMAIL;
      if (!testEmail) {
        return res.status(400).json({
          success: false,
          error: "TEST_EMAIL environment variable not set"
        });
      }

      // Check if email service is configured
      const hasMailerSend = !!process.env.MAILERSEND_API_KEY;
      const hasSendGrid = !!process.env.SENDGRID_API_KEY;
      
      if (!hasMailerSend && !hasSendGrid) {
        return res.status(400).json({
          success: false,
          error: "No email service configured. Set MAILERSEND_API_KEY or SENDGRID_API_KEY"
        });
      }

      // Import email service
      const emailService = await import("../../services/email");
      
      // Send test email
      const result = await emailService.sendTestEmail(testEmail);
      
      res.json({
        success: true,
        message: "Test email sent successfully",
        recipient: testEmail,
        service: hasMailerSend ? "MailerSend" : "SendGrid",
        timestamp: new Date().toISOString(),
        result
      });

    } catch (error: any) {
      console.error("Email test failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Email test failed",
        message: "Failed to send test email"
      });
    }
  });

  // Bill reminder email endpoint
  app.post("/api/send-bill-reminder", async (req, res) => {
    try {
      const { billId, userEmail } = req.body;
      
      if (!billId || !userEmail) {
        return res.status(400).json({
          success: false,
          error: "billId and userEmail are required"
        });
      }

      const emailService = await import("../../services/email");
      
      // Mock bill data for testing
      const mockBill = {
        id: billId,
        name: "Test Bill",
        company: "Test Company",
        amount: "99.99",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      const result = await emailService.sendBillReminderEmail(userEmail, mockBill);
      
      res.json({
        success: true,
        message: "Bill reminder sent successfully",
        recipient: userEmail,
        billId: billId,
        result
      });

    } catch (error: any) {
      console.error("Bill reminder failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send bill reminder"
      });
    }
  });

  // Payment request email endpoint
  app.post("/api/send-payment-request", async (req, res) => {
    try {
      const { to, amount, note, fromUser } = req.body;
      
      if (!to || !amount || !fromUser) {
        return res.status(400).json({
          success: false,
          error: "to, amount, and fromUser are required"
        });
      }

      const emailService = await import("../../services/email");
      
      const result = await emailService.sendPaymentRequestEmail({
        to,
        amount: parseFloat(amount),
        note: note || "Payment request",
        fromUser
      });
      
      res.json({
        success: true,
        message: "Payment request sent successfully",
        recipient: to,
        amount: amount,
        fromUser,
        result
      });

    } catch (error: any) {
      console.error("Payment request failed:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send payment request"
      });
    }
  });
}