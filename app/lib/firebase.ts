import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, browserLocalPersistence, setPersistence} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export interface Bill {
  id?: string;
  userId: string;
  providerName: string;
  billType: string;
  amount: number;
  dueDate: Date;
  createdAt: Date;
}

export async function registerUser(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function loginUser(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function addBill(userId: string, bill: Omit<Bill, 'id' | 'userId' | 'createdAt'>) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to add bills');
  }
  
  await currentUser.getIdToken(true);
  
  const docRef = await addDoc(collection(db, "bills"), {
    ...bill,
    userId,
    dueDate: Timestamp.fromDate(new Date(bill.dueDate)),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function fetchBills(userId: string): Promise<Bill[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return [];
    }
    
    await currentUser.getIdToken(true);
    
    const q = query(
      collection(db, "bills"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    
    const bills = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        providerName: data.providerName,
        billType: data.billType,
        amount: data.amount,
        dueDate: data.dueDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
    return bills.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  } catch (error) {
    console.error('Firestore fetchBills error:', error);
    throw error;
  }
}

export async function deleteBill(billId: string) {
  await deleteDoc(doc(db, "bills", billId));
}

export type { User };
