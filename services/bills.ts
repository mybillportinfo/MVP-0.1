import { db } from "../lib/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

export interface BillData {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  status: string;
  company?: string;
  priority?: string;
  icon?: string;
}

export interface FirestoreBill extends BillData {
  id: string;
}

// Add a new bill to Firestore
export async function addBill(billData: BillData): Promise<string> {
  const docRef = await addDoc(collection(db, "bills"), billData);
  return docRef.id;
}

// Get all bills from Firestore
export async function getBills(): Promise<FirestoreBill[]> {
  const querySnapshot = await getDocs(collection(db, "bills"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreBill));
}