import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "./pages/landing";
import Dashboard from "./pages/dashboard";
import FastDashboard from "./pages/fast-dashboard";
import SimpleFastDashboard from "./pages/simple-fast-dashboard";
import NoAuthDashboard from "./pages/no-auth-dashboard";
import Payments from "./pages/payments";
import Rewards from "./pages/rewards";
import Profile from "./pages/profile";
import FirebaseTest from "./pages/firebase-test";
import Signup from "./pages/signup";
import Login from "./pages/login";
import ModernLogin from "./pages/modern-login";
import SimpleLogin from "./pages/simple-login";
import AuthDashboard from "./pages/auth-dashboard";
import EnhancedDashboard from "./pages/enhanced-dashboard";
import ForgotPassword from "./pages/forgot-password";
import SimpleDashboard from "./pages/simple-dashboard";
import TestDashboard from "./pages/test-dashboard";
import StableDashboard from "./pages/stable-dashboard";
import PersonalInfo from "./pages/personal-info";
import PaymentMethods from "./pages/payment-methods";
import Notifications from "./pages/notifications";
import Security from "./pages/security";
import AppSettings from "./pages/app-settings";
import AddBill from "./pages/add-bill";
import BillDetails from "./pages/bill-details";
import CameraScan from "./pages/camera-scan";
import AISuggestions from "./pages/ai-suggestions";
import LiveChat from "./pages/live-chat";
import AIReminders from "./pages/ai-reminders";
import CreditReminders from "./pages/credit-reminders";
import PlaidIntegration from "./pages/plaid-integration";
import AutoDetectBills from "./pages/auto-detect-bills";
import EmailBills from "./pages/email-bills";
import BillSplitting from "./pages/bill-splitting";
import RequestMoney from "./pages/request-money";
import PaymentPage from "./pages/payments";
import BillsDashboard from "./pages/bills-dashboard";
import CheckoutPage from "./pages/checkout";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";
import MVPDashboard from "./pages/mvp-dashboard";
import AddBillSimple from "./pages/add-bill-simple";

function Router() {
  return (
    <Switch>
      {/* MVP Core Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/app" component={MVPDashboard} />
      <Route path="/add-bill-simple" component={AddBillSimple} />
      <Route path="/login" component={SimpleLogin} />
      <Route path="/signup" component={Signup} />
      <Route path="/profile" component={Profile} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isLandingPage = location === "/";
  
  if (isLandingPage) {
    return (
      <>
        <Toaster />
        <Router />
      </>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl">
      <Toaster />
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
