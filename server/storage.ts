import { type User, type InsertUser, type Bill, type InsertBill, type Payment, type InsertPayment, type Reward, type InsertReward, users, bills, payments, rewards } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bill operations
  getBillsByUserId(userId: string): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined>;
  markBillAsPaid(billId: string): Promise<Bill | undefined>;
  
  // Payment operations
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Reward operations
  getRewardsByUserId(userId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getBillsByUserId(userId: string): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.userId, userId));
  }

  async getBill(id: string): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill || undefined;
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    // Ensure priority is properly typed
    const validatedBill = {
      ...insertBill,
      priority: insertBill.priority as "urgent" | "medium" | "low"
    };
    const [bill] = await db
      .insert(bills)
      .values(validatedBill)
      .returning();
    return bill;
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined> {
    const [bill] = await db
      .update(bills)
      .set(updates)
      .where(eq(bills.id, id))
      .returning();
    return bill || undefined;
  }

  async markBillAsPaid(billId: string): Promise<Bill | undefined> {
    const [bill] = await db
      .update(bills)
      .set({ isPaid: 1 })
      .where(eq(bills.id, billId))
      .returning();
    return bill || undefined;
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    // Ensure status is properly typed
    const validatedPayment = {
      ...insertPayment,
      status: insertPayment.status as "pending" | "completed" | "failed"
    };
    const [payment] = await db
      .insert(payments)
      .values(validatedPayment)
      .returning();
    return payment;
  }

  async getRewardsByUserId(userId: string): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId));
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db
      .insert(rewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined> {
    const [reward] = await db
      .update(rewards)
      .set(updates)
      .where(eq(rewards.id, id))
      .returning();
    return reward || undefined;
  }

  async updateBillStatus(billId: string, status: 'paid' | 'pending' | 'overdue'): Promise<Bill | undefined> {
    const [bill] = await db
      .update(bills)
      .set({ isPaid: status === 'paid' ? 1 : 0 })
      .where(eq(bills.id, billId))
      .returning();
    return bill || undefined;
  }
}

export const storage = new DatabaseStorage();
