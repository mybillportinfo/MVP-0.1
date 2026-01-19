import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebaseClient";

export async function registerUser(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginUser(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser(): Promise<void> {
  return signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return signInWithPopup(auth, provider);
}

export async function signInWithApple(): Promise<UserCredential> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithPopup(auth, provider);
}
