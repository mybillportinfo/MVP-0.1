'use client';

import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, User, Bell, Shield, Lock, LogOut, ChevronRight, Loader2, X, Eye, EyeOff, KeyRound, MessageSquare, Receipt, DollarSign, Phone, ShieldCheck, ShieldOff, Check, AlertTriangle } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import {
  getUserPreferences, setUserPreferences,
  setupRecaptchaVerifier, clearRecaptchaVerifier,
  getLinkedProviders, getUserPhoneNumber,
  linkPhoneToCurrentUser, unlinkPhone,
  isMfaEnrolled, getMfaEnrolledFactors,
  startMfaEnrollment, completeMfaEnrollment, unenrollMfa,
} from '../lib/firebase';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type SettingsModal = 'notifications' | 'privacy' | 'security' | null;
type SecurityView = 'main' | 'link-phone' | 'enroll-mfa' | 'unenroll-mfa';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<SettingsModal>(null);
  const [securityView, setSecurityView] = useState<SecurityView>('main');

  const [inAppReminders, setInAppReminders] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [linkedPhone, setLinkedPhone] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaFactors, setMfaFactors] = useState<{ uid: string; displayName: string | null; factorId: string }[]>([]);

  const [phoneNumber, setPhoneNumber] = useState<string | undefined>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaVerificationId, setMfaVerificationId] = useState<string | null>(null);
  const [phoneConfirmation, setPhoneConfirmation] = useState<any>(null);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  const recaptchaInitialized = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setLoadingPrefs(true);
      getUserPreferences(user.uid).then(prefs => {
        setInAppReminders(prefs.inAppReminders);
      }).catch(console.error).finally(() => {
        setLoadingPrefs(false);
      });

      refreshSecurityInfo();
    }
  }, [user]);

  const refreshSecurityInfo = () => {
    setLinkedProviders(getLinkedProviders());
    setLinkedPhone(getUserPhoneNumber());
    setMfaEnabled(isMfaEnrolled());
    setMfaFactors(getMfaEnrolledFactors());
  };

  const initRecaptcha = () => {
    if (!recaptchaInitialized.current) {
      setTimeout(() => {
        const container = document.getElementById('recaptcha-settings');
        if (container) {
          setupRecaptchaVerifier('recaptcha-settings');
          recaptchaInitialized.current = true;
        }
      }, 100);
    }
  };

  const cleanupRecaptcha = () => {
    clearRecaptchaVerifier();
    recaptchaInitialized.current = false;
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    setPrefsSaved(false);
    try {
      await setUserPreferences(user.uid, { inAppReminders });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleLinkPhone = () => {
    setSecurityView('link-phone');
    setPhoneNumber('');
    setVerificationCode('');
    setCodeSent(false);
    setSecurityError(null);
    setSecuritySuccess(null);
    initRecaptcha();
  };

  const handleSendLinkCode = async () => {
    if (!phoneNumber) return;
    setSecurityLoading(true);
    setSecurityError(null);
    try {
      const confirmation = await linkPhoneToCurrentUser(phoneNumber);
      setPhoneConfirmation(confirmation);
      setCodeSent(true);
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to send verification code');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleConfirmLinkCode = async () => {
    if (!phoneConfirmation || !verificationCode) return;
    setSecurityLoading(true);
    setSecurityError(null);
    try {
      await phoneConfirmation.confirm(verificationCode);
      setSecuritySuccess('Phone number linked successfully!');
      refreshSecurityInfo();
      setTimeout(() => {
        setSecurityView('main');
        setSecuritySuccess(null);
        cleanupRecaptcha();
      }, 1500);
    } catch (err: any) {
      setSecurityError(err.message || 'Invalid verification code');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleUnlinkPhone = async () => {
    setSecurityLoading(true);
    setSecurityError(null);
    try {
      await unlinkPhone();
      setSecuritySuccess('Phone number removed');
      refreshSecurityInfo();
      setTimeout(() => setSecuritySuccess(null), 2000);
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to remove phone');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleStartMfaEnroll = () => {
    setSecurityView('enroll-mfa');
    setPhoneNumber(linkedPhone || '');
    setVerificationCode('');
    setCodeSent(false);
    setMfaVerificationId(null);
    setSecurityError(null);
    setSecuritySuccess(null);
    initRecaptcha();
  };

  const handleSendMfaCode = async () => {
    if (!phoneNumber) return;
    setSecurityLoading(true);
    setSecurityError(null);
    try {
      const verificationId = await startMfaEnrollment(phoneNumber);
      setMfaVerificationId(verificationId);
      setCodeSent(true);
    } catch (err: any) {
      const msg = err.message || 'Failed to send code';
      if (msg.includes('requires-recent-login')) {
        setSecurityError('For security, please sign out and sign back in before enabling 2FA.');
      } else {
        setSecurityError(msg);
      }
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleConfirmMfaEnroll = async () => {
    if (!mfaVerificationId || !verificationCode) return;
    setSecurityLoading(true);
    setSecurityError(null);
    try {
      await completeMfaEnrollment(mfaVerificationId, verificationCode, 'Phone');
      setSecuritySuccess('Two-factor authentication enabled!');
      refreshSecurityInfo();
      setTimeout(() => {
        setSecurityView('main');
        setSecuritySuccess(null);
        cleanupRecaptcha();
      }, 1500);
    } catch (err: any) {
      setSecurityError(err.message || 'Invalid verification code');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleUnenrollMfa = async () => {
    if (mfaFactors.length === 0) return;
    setSecurityLoading(true);
    setSecurityError(null);
    try {
      await unenrollMfa(mfaFactors[0].uid);
      setSecuritySuccess('Two-factor authentication disabled');
      refreshSecurityInfo();
      setTimeout(() => {
        setSecurityView('main');
        setSecuritySuccess(null);
      }, 1500);
    } catch (err: any) {
      const msg = err.message || 'Failed to disable 2FA';
      if (msg.includes('requires-recent-login')) {
        setSecurityError('For security, please sign out and sign back in before disabling 2FA.');
      } else {
        setSecurityError(msg);
      }
    } finally {
      setSecurityLoading(false);
    }
  };

  const closeSecurityModal = () => {
    setActiveModal(null);
    setSecurityView('main');
    setSecurityError(null);
    setSecuritySuccess(null);
    cleanupRecaptcha();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      <div className="px-5 pt-12 pb-6">
        <Link href="/app" className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            <div className="relative">
              <Receipt className="text-white w-6 h-6" />
              <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-teal-500/30">
                <DollarSign className="text-teal-400 w-3 h-3" />
              </div>
            </div>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">My<span className="text-teal-500">BillPort</span></span>
        </div>
        <p className="text-slate-400">Manage your preferences</p>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">
                {user.displayName || 'MyBillPort User'}
              </p>
              <p className="text-sm text-slate-500">{user.email}</p>
              {linkedPhone && (
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {linkedPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Free Plan</p>
              <p className="text-sm text-slate-500">Up to 5 bills</p>
            </div>
            <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
              Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden divide-y divide-slate-100">
          <button
            onClick={() => setActiveModal('notifications')}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left text-slate-800">Notifications</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={() => setActiveModal('privacy')}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
          >
            <Shield className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left text-slate-800">Privacy</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={() => { setActiveModal('security'); refreshSecurityInfo(); }}
            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
          >
            <Lock className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left text-slate-800">Security</span>
            <div className="flex items-center gap-2">
              {mfaEnabled && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">2FA On</span>
              )}
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </button>
        </div>

        <div className="bg-white rounded-xl overflow-hidden divide-y divide-slate-100">
          <Link href="/feedback" className="block p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <MessageSquare className="w-5 h-5 text-teal-500" />
            <span className="flex-1 text-slate-800">Send Feedback</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
          <Link href="/privacy" className="block p-4 hover:bg-slate-50 transition-colors">
            <span className="text-slate-800">Privacy Policy</span>
          </Link>
          <Link href="/terms" className="block p-4 hover:bg-slate-50 transition-colors">
            <span className="text-slate-800">Terms of Service</span>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl p-4 flex items-center gap-4 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-red-500 font-medium">Sign Out</span>
        </button>

        <p className="text-center text-slate-600 text-xs pt-2">
          MyBillPort v1.0 Production
        </p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/add-bill" className="nav-item">
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add Bill</span>
          </Link>
          <Link href="/settings" className="nav-item nav-item-active">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>

      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            {activeModal === 'notifications' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-teal-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  {loadingPrefs ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-800">In-App Notifications</p>
                            <p className="text-sm text-slate-500">Get notified when bills are due</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setInAppReminders(!inAppReminders)}
                          className={`w-12 h-7 rounded-full transition-colors relative ${inAppReminders ? 'bg-teal-500' : 'bg-slate-300'}`}
                        >
                          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${inAppReminders ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-slate-700">When enabled, you receive notifications for:</p>
                        <ul className="text-sm text-slate-600 space-y-1.5">
                          <li className="flex items-center gap-2"><span className="text-teal-500">&#10003;</span>New bills added</li>
                          <li className="flex items-center gap-2"><span className="text-teal-500">&#10003;</span>Bills due in 7 days</li>
                          <li className="flex items-center gap-2"><span className="text-teal-500">&#10003;</span>Bills due in 3 days</li>
                          <li className="flex items-center gap-2"><span className="text-teal-500">&#10003;</span>Bills due tomorrow</li>
                          <li className="flex items-center gap-2"><span className="text-teal-500">&#10003;</span>Bills due today</li>
                          <li className="flex items-center gap-2"><span className="text-teal-500">&#10003;</span>Overdue bills</li>
                        </ul>
                      </div>

                      {prefsSaved && (
                        <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-lg text-sm text-center">
                          Preferences saved!
                        </div>
                      )}

                      <button
                        onClick={handleSavePreferences}
                        disabled={savingPrefs}
                        className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {savingPrefs ? (<><Loader2 className="w-5 h-5 animate-spin" />Saving...</>) : 'Save Preferences'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Privacy</h2>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">Data Visibility</p>
                        <p className="text-sm text-slate-500">Your bill data is only visible to you</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Private</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EyeOff className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-800">Hide Bill Amounts</p>
                        <p className="text-sm text-slate-500">Mask dollar amounts on dashboard</p>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">Coming Soon</span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-slate-800">Your Data Rights</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>All your data is encrypted and stored securely</li>
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>We never sell or share your personal information</li>
                      <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>You can request data deletion at any time</li>
                    </ul>
                  </div>

                  <Link
                    href="/privacy"
                    onClick={() => setActiveModal(null)}
                    className="block w-full text-center py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Read Full Privacy Policy
                  </Link>
                </div>
              </div>
            )}

            {activeModal === 'security' && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {securityView !== 'main' && (
                      <button
                        onClick={() => { setSecurityView('main'); setSecurityError(null); setSecuritySuccess(null); cleanupRecaptcha(); }}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                      </button>
                    )}
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {securityView === 'main' && 'Security'}
                      {securityView === 'link-phone' && 'Link Phone'}
                      {securityView === 'enroll-mfa' && 'Enable 2FA'}
                      {securityView === 'unenroll-mfa' && 'Disable 2FA'}
                    </h2>
                  </div>
                  <button onClick={closeSecurityModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {securityError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {securityError}
                    </div>
                  )}

                  {securitySuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {securitySuccess}
                    </div>
                  )}

                  {securityView === 'main' && (
                    <>
                      <div className={`flex items-center gap-3 p-3 rounded-lg border ${mfaEnabled ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                        {mfaEnabled ? <ShieldCheck className="w-5 h-5 text-green-600" /> : <Shield className="w-5 h-5 text-slate-400" />}
                        <div>
                          <p className={`font-medium ${mfaEnabled ? 'text-green-800' : 'text-slate-800'}`}>
                            {mfaEnabled ? 'Account Extra Secured' : 'Account Secured'}
                          </p>
                          <p className={`text-sm ${mfaEnabled ? 'text-green-600' : 'text-slate-500'}`}>
                            {mfaEnabled ? 'Two-factor authentication is active' : 'Protected with Firebase Auth'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium text-slate-800">Sign-in Methods</h3>

                        {linkedProviders.includes('password') && (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <KeyRound className="w-5 h-5 text-slate-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">Email & Password</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">Active</span>
                          </div>
                        )}

                        {linkedProviders.includes('google.com') && (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">Google Account</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">Active</span>
                          </div>
                        )}

                        {linkedPhone ? (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">Phone Number</p>
                              <p className="text-xs text-slate-500">{linkedPhone}</p>
                            </div>
                            <button
                              onClick={handleUnlinkPhone}
                              disabled={securityLoading || linkedProviders.length <= 1}
                              className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleLinkPhone}
                            className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Phone className="w-5 h-5 text-teal-500" />
                            <span className="flex-1 text-left text-sm font-medium text-teal-700">Add Phone Number</span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium text-slate-800">Two-Factor Authentication</h3>
                        <p className="text-sm text-slate-500">
                          Add an extra layer of security. When enabled, you&apos;ll need to enter a code from your phone each time you sign in.
                        </p>

                        {mfaEnabled ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <ShieldCheck className="w-5 h-5 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">2FA is Active</p>
                                <p className="text-xs text-green-600">
                                  {mfaFactors[0]?.displayName || 'Phone'} enrolled
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSecurityView('unenroll-mfa')}
                              className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                            >
                              Disable Two-Factor Authentication
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleStartMfaEnroll}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
                          >
                            <ShieldCheck className="w-5 h-5" />
                            Enable Two-Factor Authentication
                          </button>
                        )}
                      </div>

                      {!linkedProviders.includes('google.com') && linkedProviders.includes('password') && (
                        <Link
                          href="/forgot-password"
                          onClick={closeSecurityModal}
                          className="block w-full text-center py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                          Change Password
                        </Link>
                      )}

                      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <h3 className="font-medium text-slate-800">Security Features</h3>
                        <ul className="text-sm text-slate-600 space-y-2">
                          <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>Encrypted data transmission (TLS/SSL)</li>
                          <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>Per-user data isolation in Firestore</li>
                          <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">&#10003;</span>Secure session management</li>
                          {mfaEnabled && (
                            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span>Two-factor authentication (SMS)</li>
                          )}
                        </ul>
                      </div>
                    </>
                  )}

                  {securityView === 'link-phone' && (
                    <>
                      {!codeSent ? (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-600">
                            Link a phone number to your account so you can sign in with it.
                          </p>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <div className="phone-input-light">
                              <PhoneInput
                                international
                                defaultCountry="CA"
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                placeholder="Enter phone number"
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          </div>
                          <button
                            onClick={handleSendLinkCode}
                            disabled={securityLoading || !phoneNumber}
                            className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {securityLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Sending code...</>) : 'Send Verification Code'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-lg text-sm text-center">
                            Code sent to {phoneNumber}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter 6-digit code"
                              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-center text-2xl tracking-[0.3em] font-mono"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={handleConfirmLinkCode}
                            disabled={securityLoading || verificationCode.length < 6}
                            className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {securityLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Verifying...</>) : 'Link Phone Number'}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {securityView === 'enroll-mfa' && (
                    <>
                      {!codeSent ? (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-600">
                            Enter the phone number where you&apos;d like to receive verification codes when signing in.
                          </p>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number for 2FA</label>
                            <div className="phone-input-light">
                              <PhoneInput
                                international
                                defaultCountry="CA"
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                placeholder="Enter phone number"
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                          <button
                            onClick={handleSendMfaCode}
                            disabled={securityLoading || !phoneNumber}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {securityLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Sending code...</>) : 'Send Verification Code'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg text-sm text-center">
                            Code sent to {phoneNumber}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter 6-digit code"
                              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-[0.3em] font-mono"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={handleConfirmMfaEnroll}
                            disabled={securityLoading || verificationCode.length < 6}
                            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {securityLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Enabling 2FA...</>) : 'Enable Two-Factor Authentication'}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {securityView === 'unenroll-mfa' && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                        <p className="font-medium mb-1">Are you sure?</p>
                        <p>Disabling two-factor authentication will make your account less secure. You can re-enable it anytime.</p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => { setSecurityView('main'); setSecurityError(null); }}
                          className="flex-1 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                          Keep Enabled
                        </button>
                        <button
                          onClick={handleUnenrollMfa}
                          disabled={securityLoading}
                          className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {securityLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Disabling...</>) : 'Disable 2FA'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div id="recaptcha-settings" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
