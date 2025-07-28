import { type User, type InsertUser, type Bill, type InsertBill, type Payment, type InsertPayment, type Reward, type InsertReward } from "@shared/schema";
import { randomUUID } from "crypto";

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
  
  // Payment operations
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Reward operations
  getRewardsByUserId(userId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bills: Map<string, Bill>;
  private payments: Map<string, Payment>;
  private rewards: Map<string, Reward>;

  constructor() {
    this.users = new Map();
    this.bills = new Map();
    this.payments = new Map();
    this.rewards = new Map();
    
    // Initialize with demo user and bills
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: "demo-user-1",
      username: "johndoe",
      password: "demo123",
      name: "John Doe"
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo bills
    const demoBills: Bill[] = [
      {
        id: "bill-1",
        userId: demoUser.id,
        name: "Electricity Bill",
        company: "ConEd Energy",
        amount: "247.80",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        priority: "urgent",
        icon: "fas fa-bolt",
        isPaid: 0,
        createdAt: new Date()
      },
      {
        id: "bill-2",
        userId: demoUser.id,
        name: "Credit Card",
        company: "Chase Sapphire",
        amount: "1245.30",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        priority: "urgent",
        icon: "fas fa-credit-card",
        isPaid: 0,
        createdAt: new Date()
      },
      {
        id: "bill-3",
        userId: demoUser.id,
        name: "Internet Bill",
        company: "Spectrum",
        amount: "89.99",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
        priority: "medium",
        icon: "fas fa-wifi",
        isPaid: 0,
        createdAt: new Date()
      },
      {
        id: "bill-4",
        userId: demoUser.id,
        name: "Phone Bill",
        company: "Verizon",
        amount: "125.00",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
        priority: "medium",
        icon: "fas fa-phone",
        isPaid: 0,
        createdAt: new Date()
      },
      {
        id: "bill-5",
        userId: demoUser.id,
        name: "Netflix",
        company: "Streaming Service",
        amount: "15.99",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // in 15 days
        priority: "low",
        icon: "fas fa-tv",
        isPaid: 0,
        createdAt: new Date()
      }
    ];

    demoBills.forEach(bill => this.bills.set(bill.id, bill));

    // Create demo rewards
    const demoRewards: Reward[] = [
      {
        id: "reward-1",
        userId: demoUser.id,
        points: 250,
        title: "On-time Payment Bonus",
        description: "Earned for paying 5 bills on time",
        isRedeemed: 0,
        createdAt: new Date()
      },
      {
        id: "reward-2",
        userId: demoUser.id,
        points: 100,
        title: "First Payment",
        description: "Welcome bonus for first payment",
        isRedeemed: 0,
        createdAt: new Date()
      }
    ];

    demoRewards.forEach(reward => this.rewards.set(reward.id, reward));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBillsByUserId(userId: string): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(bill => bill.userId === userId);
  }

  async getBill(id: string): Promise<Bill | undefined> {
    return this.bills.get(id);
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const id = randomUUID();
    const bill: Bill = { 
      ...insertBill, 
      id, 
      createdAt: new Date() 
    };
    this.bills.set(id, bill);
    return bill;
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined> {
    const existingBill = this.bills.get(id);
    if (!existingBill) return undefined;
    
    const updatedBill = { ...existingBill, ...updates };
    this.bills.set(id, updatedBill);
    return updatedBill;
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.userId === userId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      paymentDate: new Date() 
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getRewardsByUserId(userId: string): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(reward => reward.userId === userId);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = { 
      ...insertReward, 
      id, 
      createdAt: new Date() 
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward | undefined> {
    const existingReward = this.rewards.get(id);
    if (!existingReward) return undefined;
    
    const updatedReward = { ...existingReward, ...updates };
    this.rewards.set(id, updatedReward);
    return updatedReward;
  }
}

export const storage = new MemStorage();
