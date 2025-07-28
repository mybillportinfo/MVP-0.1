import { db } from "../lib/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Add a new bill to Firestore
export async function addBill(billData) {
  const docRef = await addDoc(collection(db, "bills"), billData);
  return docRef.id;
}

// Get all bills from Firestore
export async function getBills() {
  const querySnapshot = await getDocs(collection(db, "bills"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}