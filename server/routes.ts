import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBillSchema, insertPaymentSchema, insertRewardSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEMO_USER_ID = "demo-user-1"; // For demo purposes

  // Get user bills
  app.get("/api/bills", async (req, res) => {
    try {
      const bills = await storage.getBillsByUserId(DEMO_USER_ID);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  // Create new bill
  app.post("/api/bills", async (req, res) => {
    try {
      const billData = insertBillSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const bill = await storage.createBill(billData);
      res.json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bill data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bill" });
      }
    }
  });

  // Pay a bill
  app.post("/api/bills/:id/pay", async (req, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.getBill(id);
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      // Create payment record
      const payment = await storage.createPayment({
        billId: id,
        userId: DEMO_USER_ID,
        amount: bill.amount,
        status: "completed"
      });

      // Mark bill as paid
      await storage.updateBill(id, { isPaid: 1 });

      // Award points for payment
      await storage.createReward({
        userId: DEMO_USER_ID,
        points: Math.floor(parseFloat(bill.amount) / 10), // 1 point per $10
        title: "Payment Reward",
        description: `Earned for paying ${bill.name}`,
        isRedeemed: 0
      });

      res.json({ payment, message: "Payment processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  // Get user payments
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByUserId(DEMO_USER_ID);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Get user rewards
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getRewardsByUserId(DEMO_USER_ID);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  // Redeem reward
  app.post("/api/rewards/:id/redeem", async (req, res) => {
    try {
      const { id } = req.params;
      const reward = await storage.updateReward(id, { isRedeemed: 1 });
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }

      res.json({ reward, message: "Reward redeemed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // Scan bill endpoint (mock)
  app.post("/api/bills/scan", async (req, res) => {
    try {
      // Simulate bill scanning
      setTimeout(() => {
        res.json({ 
          message: "Bill scanned successfully",
          billData: {
            name: "Scanned Bill",
            company: "Utility Company",
            amount: "99.99",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            priority: "medium",
            icon: "fas fa-file-invoice"
          }
        });
      }, 1000);
    } catch (error) {
      res.status(500).json({ message: "Bill scanning failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
