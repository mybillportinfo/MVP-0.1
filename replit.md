# BillPort - Bill Management App (Canada)

## Overview
BillPort is a Canadian bill management web app. Users can add bills, track them on a dashboard, and pay by being redirected to the biller's official payment website. Features Firebase Auth (email/password + Google OAuth), Firestore database, 100+ Canadian biller payment URLs, in-app notifications, and a premium fintech UI (navy/slate/muted-teal).

## GitHub Repository
- **Push URL**: https://github.com/mybillportinfo/mybillportMvp-0.1.git
- Always push to this repo when the user asks to push to GitHub.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (February 21, 2026)
- ✅ Removed phone authentication: no more Phone tabs on login/signup, no SMS costs
- ✅ Removed phone MFA: SMS-based 2FA removed; email-based MFA planned (marked "Coming Soon")
- ✅ Removed all phone helpers from firebase.ts: sendPhoneCode, confirmPhoneCode, linkPhone, MFA enrollment/unenrollment, RecaptchaVerifier
- ✅ Cleaned AuthContext: removed MFA state management, phone methods; MFA error shows support contact message
- ✅ Profile section in Settings: username field, email change, profile photo upload/remove, delete account
- ✅ UserProfile model (Firestore userProfiles collection): userId, username, email, photoURL, updatedAt
- ✅ Profile CRUD: getUserProfile, saveUserProfile, updateUserDisplayName, updateUserProfilePhoto, updateUserEmail, deleteUserAccount
- ✅ Delete account: deletes all user bills, notifications, preferences, profile from Firestore + Firebase Auth
- ✅ Notification preferences: replaced toggle with checkboxes (7 days, 2 days, 1 day, same day before due)
- ✅ UserPreferences.notifyDays: number[] replaces hardcoded notification intervals
- ✅ checkAndCreateDueDateNotifications uses notifyDays array; overdue bills always notified
- ✅ Settings Security section simplified: email verification status, change password link, 2FA "Coming Soon"
- ✅ Auth: Email/password + Google Sign-In only (no phone, no MFA)

## Previous Changes (February 19, 2026)
- ✅ Smart Add Bill: 4 input methods (Search Company, Camera Scan, Upload Photo, Upload PDF)
- ✅ AI-powered bill extraction: Claude Vision (claude-sonnet-4-5) analyzes bill images/PDFs
- ✅ API route `/api/extract-bill`: accepts base64 image/PDF, returns structured bill data (runtime="nodejs" for Vercel)
- ✅ PDF extraction via Claude document API (no pdf-parse dependency)
- ✅ Vercel-ready: uses only ANTHROPIC_API_KEY (no Replit dependency in production)
- ✅ Provider fuzzy matching (app/lib/fuzzyMatch.ts): Levenshtein + token overlap for vendor → provider matching
- ✅ Smart Review UI: "Smart Bill Detected" screen with confidence indicators (High/Medium/Low per field)
- ✅ Editable extracted fields: all AI-extracted data is pre-filled but fully editable before confirm
- ✅ Extraction types defined (app/lib/billExtraction.ts): BillExtractionResult, ExtractionRequest/Response
- ✅ Method selection UI: cards for Search, Camera, Photo, PDF with sparkle indicators for AI features
- ✅ Loading state with animated sparkle icon during AI analysis
- ✅ Error handling with "Try Again" or "Enter Manually" fallbacks
- ✅ File size limit: 10MB max per upload
- ✅ Existing manual company search preserved as primary method
- ✅ Rate limiting: per-user 10 scans/day, server-side enforcement in /api/extract-bill
- ✅ Duplicate file detection: content hash prevents re-scanning same file within 1 hour
- ✅ Duplicate bill detection: vendor+amount+dueDate comparison against existing bills before confirm
- ✅ Validation & sanitization (app/lib/extractionGuards.ts): amount format, date normalization, impossible date rejection
- ✅ Double-submission prevention: isSubmitting guard + AbortController timeout (60s)
- ✅ Validation warnings UI: blue banner shows date/amount issues from AI extraction
- ✅ Duplicate warning UI: amber banner flags possible duplicate bills with dismiss option
- ✅ Strict amount validation: rejects NaN, Infinity, negative, >$1M
- ✅ Strict date validation: rejects >2 years future, invalid format, NaN dates
- ✅ Usage logging: server logs userId, fileType, processingMs per extraction

## Previous Changes (February 17, 2026)
- ✅ Dashboard pagination: bills load 10 at a time with "Load More" button
- ✅ Escape key closes Edit Bill and Mark as Paid modals
- ✅ Amount fields block negative/invalid characters (-, e, E, +)
- ✅ Console.log cleanup for production readiness
- ✅ Feedback simplified to Formspree integration (no Cloud Function needed)

## Previous Changes (February 13, 2026)
- ✅ Recurring Intelligence Engine: auto-detects recurring bills when same biller appears 2+ times
- ✅ detectRecurringPatterns() analyzes due date intervals to classify monthly/quarterly/yearly frequency
- ✅ Confidence scoring: (matching intervals / total) * (min(occurrences,5) / 5), threshold 0.5
- ✅ Amount change alerts: flags when recurring bill deviates >15% or >$10 from rolling average
- ✅ Recurring badge (purple pill with 🔄) on bill cards showing detected frequency
- ✅ Amount change alert banner (red for increase, amber for decrease) with dismiss button
- ✅ Recurring bills summary card on dashboard showing count + total upcoming recurring
- ✅ Recurring confirmation modal in add-bill flow when 2nd bill for same provider is added
- ✅ confirmRecurring() and dismissAmountAlert() Firestore persistence functions
- ✅ applyRecurringDetection() enriches bills with recurring flags on every load
- ✅ persistRecurringFlags() saves detection results to Firestore in background
- ✅ Edit Bill feature: pencil icon on every bill card opens modal to update biller name, account number, amount, due date
- ✅ updateBill() in firebase.ts with ownership check, validation, and auto status recalculation
- ✅ Edit modal matches app theme (white modal, teal accents, same styling as Mark Paid modal)
- ✅ "Mark as Paid" feature: green button on each unpaid bill, opens modal with method/confirmation/notes
- ✅ Payment history: subcollection bills/{billId}/payments stores each payment record
- ✅ Payment history accordion on paid bill cards (History button expands/collapses)
- ✅ markBillAsPaid() uses Firestore transaction, writes to subcollection + top-level payments
- ✅ getPaymentHistory() reads from subcollection ordered by paidAt desc
- ✅ Success toast notification after marking paid
- ✅ Firebase Auth persistence already set to browserLocalPersistence (stay logged in)
- ✅ Payment flow changed: removed in-app Stripe Elements, now redirects to biller's official payment page
- ✅ Payment URL registry (app/lib/paymentUrls.ts): 100+ Canadian billers with direct payment URLs
- ✅ New /payment page: mobile-first, shows biller name + "Pay Now on [Biller] Website" button
- ✅ Fallback: if biller not in registry, "Find Payment Page" button searches Google
- ✅ Dashboard simplified: single "Pay" button per bill + "Mark Paid" button
- ✅ Removed Stripe Elements and payment modal from dashboard
- ✅ Privacy Policy updated: PIPEDA-compliant, Firebase/Google Cloud disclosure, cookies, contact info
- ✅ Terms of Service updated: removed Plaid/Gmail references, accurate to actual features
- ✅ Landing page: CTA changed to "Get Early Access", removed false "Join thousands" claim
- ✅ Footer: added Contact email link, copyright notice

## Previous Changes (February 10, 2026)
- ✅ Provider normalization: every bill now stores providerId + providerName
- ✅ Provider registry (app/lib/providerRegistry.ts): 120+ Canadian providers mapped to stable IDs
- ✅ resolveProvider() utility: known providers get registry ID, custom providers get "custom_<slug>"
- ✅ addBill() validates providerId + providerName are non-empty before Firestore write
- ✅ fetchBills() backward compatible: old bills get providerId="unknown", providerName=companyName
- ✅ Bill interface updated: providerId (required), providerName (required), isCustomProvider (optional)
- ✅ Simplified Bill model: companyName, accountNumber, dueDate, totalAmount, paidAmount, status
- ✅ Status badges: Unpaid, Partial, Paid, Overdue
- ✅ Sort order: Overdue first, then upcoming, paid at bottom

## Older Changes
- ✅ 7-day due notification trigger added
- ✅ Canadian billers expanded to 120+ with proper category/subcategory mapping
- ✅ In-app notification system with Firestore backend
- ✅ Notifications page with mark-as-read, mark-all-read, type-specific badges
- ✅ Bell icon with unread badge on dashboard
- ✅ Auth: Email/password + Google Sign-In
- ✅ Forgot Password flow
- ✅ Firestore rules: per-user data isolation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Next.js App Router
- **Styling**: Tailwind CSS with custom CSS variables (dark theme)
- **Design System**: Premium fintech theme (navy/slate/muted teal)
- **Payments**: Redirect to biller's official payment website (no in-app payment processing)

### Core Pages
- `/` - Landing page with dark theme
- `/login` - Sign in with email/password or Google
- `/signup` - Create account with email/password or Google
- `/forgot-password` - Password reset via email
- `/app` - Dashboard: bill cards with status badges, single Pay button per bill
- `/add-bill` - Add bill with company name, account number, due date, total amount
- `/payment` - Payment redirect page: shows biller name + "Pay Now on [Biller] Website" button
- `/notifications` - Notification list with type badges, mark read/mark all read
- `/settings` - Profile, plan (5 bills free), notifications toggle, privacy/security modals
- `/feedback` - Feedback form (category selector + message), writes to Firestore feedback collection
- `/privacy` - Full privacy policy page (PIPEDA-compliant)
- `/terms` - Full terms of service page

### Backend Architecture
- **Runtime**: Next.js (App Router, serverless-ready)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL, per-user data isolation)
- **Authentication**: Firebase Auth (email/password, Google OAuth)

### Payment Flow
1. User clicks "Pay $X.XX" on a bill card in the dashboard
2. Navigates to `/payment?biller=CompanyName&amount=XX.XX`
3. Payment page shows biller name and amount
4. If biller is in the registry: "Pay Now on [Biller] Website" button opens their payment page in a new tab
5. If biller is not found: "Find Payment Page" button searches Google for "[Biller] pay bill Canada"

### Payment URL Registry (app/lib/paymentUrls.ts)
- 274 Canadian billers with direct payment/account URLs
- Categories: Utilities (electricity, gas, water), Telecom (mobile/internet/cable), Government (federal/provincial/municipal), Insurance (auto/home/life - public + private), Banking (credit cards/loans), Mortgage Lenders, Transportation (toll/transit), Education (student loans), Subscriptions (digital), Property Management, Miscellaneous Recurring
- Case-insensitive fuzzy matching via getPaymentUrl()
- Google search fallback via getGoogleSearchUrl()

### Firestore Collections
- `bills` - userId, companyName, accountNumber, dueDate, totalAmount, paidAmount, status, paidAt, lastPaymentAmount, lastPaymentDate, createdAt
- `bills/{billId}/payments` - (subcollection) paidAt, amount, method, confirmationCode, recordedVia, notes, userId
- `notifications` - userId, title, message, type, relatedBillId, isRead, createdAt
- `payments` - (top-level audit trail) userId, billId, amountPaid, paymentType, method, recordedVia, timestamp
- `userPreferences` - inAppReminders (boolean)
- `feedback` - userId, userEmail, userName, category, message, createdAt (create-only, no read/update/delete)

### Bill Status Values
- **unpaid** - No payment made (paidAmount = 0)
- **partial** - Some payment made (0 < paidAmount < totalAmount)
- **paid** - Fully paid (paidAmount >= totalAmount)

### API Routes (legacy, still present)
- `GET /api/stripe-publishable-key` - Returns Stripe publishable key
- `POST /api/create-payment-intent` - Creates Stripe PaymentIntent
- `POST /api/stripe-webhook` - Handles Stripe webhook events

### Key Features
- **Bill CRUD**: Add (company name, account number, due date, amount), delete
- **Free Plan Limit**: Maximum 5 bills per user
- **Biller Payment Redirect**: Single "Pay" button redirects to biller's official payment website
- **100+ Canadian Billers**: Pre-mapped payment URLs for major utilities, telecoms, banks, insurance
- **Google Fallback**: Unknown billers get a Google search link
- **Status Badges**: Unpaid, Partial, Paid, Overdue
- **Sort Order**: Overdue → Upcoming → Paid (at bottom)
- **In-App Notifications**: Bell icon with unread count, type-specific badges
- **Auth**: Email/password + Google Sign-In + Forgot Password
- **Profile Management**: Username, email change, profile photo upload, delete account

### Features NOT Included (Strict)
- ❌ No in-app payment processing (redirects to biller website)
- ❌ No partial payment option
- ❌ No Plaid, no bank logins
- ❌ No Gmail parsing
- ❌ No SMS/email/push notifications
- ✅ Edit bill (biller name, account number, amount, due date)
- ❌ No real-time bank sync

## External Dependencies
- **firebase**: Firebase SDK (Auth + Firestore)
- **next**: Next.js framework with App Router
- **lucide-react**: Icon library
- **stripe**: Stripe server SDK (legacy API routes still present)
- **@stripe/stripe-js**: Stripe client SDK (legacy, no longer used in dashboard)
- **@stripe/react-stripe-js**: Stripe React components (legacy, no longer used in dashboard)

## Firebase Configuration
- **Project ID**: mybillport-8e05a
- **Auth Methods**: Email/password, Google OAuth
- **Environment Variables**: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
