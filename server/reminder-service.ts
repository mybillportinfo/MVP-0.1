import { db } from './db';
import { bills, users } from '@shared/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { sendBillReminderEmail } from '../services/email';

type ReminderType = '7-days' | '2-days' | 'due-today' | 'overdue';

interface ReminderResult {
  billId: string;
  billName: string;
  reminderType: ReminderType;
  success: boolean;
  error?: string;
}

function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getReminderType(daysUntilDue: number): ReminderType | null {
  if (daysUntilDue === 7) return '7-days';
  if (daysUntilDue === 2) return '2-days';
  if (daysUntilDue === 0) return 'due-today';
  if (daysUntilDue < 0) return 'overdue';
  return null;
}

export async function processReminders(): Promise<ReminderResult[]> {
  const results: ReminderResult[] = [];
  
  try {
    const unpaidBills = await db
      .select({
        bill: bills,
        user: users
      })
      .from(bills)
      .innerJoin(users, eq(bills.userId, users.id))
      .where(eq(bills.isPaid, 0));

    console.log(`📧 Processing reminders for ${unpaidBills.length} unpaid bills`);

    for (const { bill, user } of unpaidBills) {
      const daysUntilDue = getDaysUntilDue(new Date(bill.dueDate));
      const reminderType = getReminderType(daysUntilDue);

      if (reminderType) {
        const userEmail = user.username;
        
        if (userEmail && userEmail.includes('@')) {
          const result = await sendBillReminderEmail(userEmail, bill, reminderType);
          results.push({
            billId: bill.id,
            billName: bill.name,
            reminderType,
            success: result.success,
            error: result.error
          });
        } else {
          console.log(`⚠️ No valid email for user ${user.id}, skipping reminder for ${bill.name}`);
        }
      }
    }

    console.log(`✅ Processed ${results.length} reminders`);
    return results;
  } catch (error) {
    console.error('❌ Error processing reminders:', error);
    throw error;
  }
}

export async function sendTestReminder(email: string, billId: string, reminderType: ReminderType): Promise<ReminderResult> {
  try {
    const [bill] = await db.select().from(bills).where(eq(bills.id, billId));
    
    if (!bill) {
      return { billId, billName: 'Unknown', reminderType, success: false, error: 'Bill not found' };
    }

    const result = await sendBillReminderEmail(email, bill, reminderType);
    return {
      billId: bill.id,
      billName: bill.name,
      reminderType,
      success: result.success,
      error: result.error
    };
  } catch (error: any) {
    return { billId, billName: 'Unknown', reminderType, success: false, error: error.message };
  }
}
