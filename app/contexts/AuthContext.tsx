'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  subscribeToAuth,
  loginUser,
  registerUser,
  logoutUser,
  signInWithGoogle,
  sendPhoneCode,
  confirmPhoneCode,
  setupRecaptchaVerifier,
  clearRecaptchaVerifier,
  isMfaError,
  getMfaResolver,
  sendMfaVerificationCode,
  completeMfaSignIn,
  MultiFactorResolver,
} from '../lib/firebase';
import { trackUserLogin, trackUserSignup } from '../lib/analyticsService';

interface MfaState {
  resolver: MultiFactorResolver;
  verificationId: string | null;
  phoneHint: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phoneNumber: string) => Promise<void>;
  confirmPhone: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  mfaState: MfaState | null;
  initMfaVerification: () => Promise<void>;
  completeMfa: (code: string) => Promise<void>;
  cancelMfa: () => void;
  phoneCodeSent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaState, setMfaState] = useState<MfaState | null>(null);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await loginUser(email, password);
      trackUserLogin('email');
    } catch (err: unknown) {
      if (isMfaError(err)) {
        const resolver = getMfaResolver(err);
        const hint = resolver.hints[0] as any;
        const phoneHint = hint?.phoneNumber || null;
        setMfaState({ resolver, verificationId: null, phoneHint });
        setLoading(false);
        return;
      }
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await registerUser(email, password);
      trackUserSignup('email');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleFn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      trackUserLogin('google');
    } catch (err: unknown) {
      if (isMfaError(err)) {
        const resolver = getMfaResolver(err);
        const hint = resolver.hints[0] as any;
        const phoneHint = hint?.phoneNumber || null;
        setMfaState({ resolver, verificationId: null, phoneHint });
        setLoading(false);
        return;
      }
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhone = async (phoneNumber: string) => {
    setError(null);
    setPhoneCodeSent(false);
    try {
      await sendPhoneCode(phoneNumber);
      setPhoneCodeSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send code';
      setError(getAuthErrorMessage(message));
      throw err;
    }
  };

  const confirmPhone = async (code: string) => {
    setError(null);
    setLoading(true);
    try {
      await confirmPhoneCode(code);
      setPhoneCodeSent(false);
      trackUserLogin('email');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const initMfaVerification = async () => {
    if (!mfaState?.resolver) return;
    setError(null);
    try {
      const verificationId = await sendMfaVerificationCode(mfaState.resolver);
      setMfaState(prev => prev ? { ...prev, verificationId } : null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send verification code';
      setError(getAuthErrorMessage(message));
      throw err;
    }
  };

  const completeMfa = async (code: string) => {
    if (!mfaState?.resolver || !mfaState.verificationId) return;
    setError(null);
    setLoading(true);
    try {
      await completeMfaSignIn(mfaState.resolver, mfaState.verificationId, code);
      setMfaState(null);
      trackUserLogin('email');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid verification code';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelMfa = () => {
    setMfaState(null);
    setError(null);
  };

  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user, loading, error, login, signup,
      loginWithGoogle: loginWithGoogleFn,
      loginWithPhone, confirmPhone,
      logout, clearError,
      mfaState, initMfaVerification, completeMfa, cancelMfa,
      phoneCodeSent,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getAuthErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('auth/email-already-in-use')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (errorMessage.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (errorMessage.includes('auth/weak-password')) {
    return 'Password must be at least 6 characters.';
  }
  if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/invalid-credential')) {
    return 'Invalid email or password.';
  }
  if (errorMessage.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please try again later.';
  }
  if (errorMessage.includes('auth/popup-closed-by-user')) {
    return 'Sign-in was cancelled. Please try again.';
  }
  if (errorMessage.includes('auth/popup-blocked')) {
    return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
  }
  if (errorMessage.includes('auth/cancelled-popup-request')) {
    return 'Sign-in was cancelled. Please try again.';
  }
  if (errorMessage.includes('auth/invalid-phone-number')) {
    return 'Please enter a valid phone number with country code.';
  }
  if (errorMessage.includes('auth/invalid-verification-code')) {
    return 'The code you entered is incorrect. Please try again.';
  }
  if (errorMessage.includes('auth/code-expired')) {
    return 'The verification code has expired. Please request a new one.';
  }
  if (errorMessage.includes('auth/missing-phone-number')) {
    return 'Please enter a phone number.';
  }
  if (errorMessage.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists with a different sign-in method. Try signing in with your email instead.';
  }
  if (errorMessage.includes('auth/requires-recent-login')) {
    return 'For security, please sign out and sign back in before making this change.';
  }
  if (errorMessage.includes('auth/quota-exceeded')) {
    return 'SMS quota exceeded. Please try again later or use a different sign-in method.';
  }
  if (errorMessage.includes('auth/credential-already-in-use')) {
    return 'This phone number is already linked to another account.';
  }
  if (errorMessage.includes('auth/provider-already-linked')) {
    return 'A phone number is already linked to this account.';
  }
  if (errorMessage.includes('auth/invalid-verification-id')) {
    return 'Verification session expired. Please request a new code.';
  }
  if (errorMessage.includes('auth/captcha-check-failed')) {
    return 'Security verification failed. Please refresh the page and try again.';
  }
  if (errorMessage.includes('reCAPTCHA not initialized')) {
    return 'Security verification not ready. Please refresh the page and try again.';
  }
  if (errorMessage.includes('Firebase not available')) {
    return 'Unable to connect to authentication service. Please refresh and try again.';
  }
  return errorMessage;
}
