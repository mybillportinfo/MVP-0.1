import { useEffect, useState } from "react";
import { Home, CreditCard, Gift, User, LogOut } from "lucide-react";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";
// @ts-ignore
import { logoutUser } from "../../../services/auth.js";

export default function StableDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (!mounted) return;
      
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Redirect to login if no user
        window.location.href = "/login";
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="MyBillPort Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">MyBillPort</h1>
                <p className="text-sm text-gray-600">Welcome back!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 pb-20">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Info</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-800">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="font-medium text-gray-800 text-xs">{user.uid.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">5</p>
              <p className="text-sm text-gray-600">Total Bills</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">$847</p>
              <p className="text-sm text-gray-600">Amount Due</p>
            </div>
          </div>
        </div>

        {/* Sample Bills */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bills</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Electric Bill</h4>
                <p className="text-sm text-gray-600">Due: Jan 30, 2025</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">$125.50</p>
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">Pending</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Water Bill</h4>
                <p className="text-sm text-gray-600">Due: Feb 5, 2025</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">$67.25</p>
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">Pending</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Internet</h4>
                <p className="text-sm text-gray-600">Due: Feb 10, 2025</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">$89.99</p>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Paid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-100 shadow-lg">
        <div className="grid grid-cols-4 py-1">
          <button className="flex flex-col items-center py-3 px-4 text-blue-600">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button 
            onClick={() => window.location.href = "/payments"}
            className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-blue-600"
          >
            <CreditCard className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Payments</span>
          </button>
          <button 
            onClick={() => window.location.href = "/rewards"}
            className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-blue-600"
          >
            <Gift className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Rewards</span>
          </button>
          <button 
            onClick={() => window.location.href = "/profile"}
            className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-blue-600"
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}