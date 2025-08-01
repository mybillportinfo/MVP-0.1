import { useEffect, useState } from "react";
import { Home, CreditCard, Gift, User, ArrowLeft } from "lucide-react";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";

export default function Payments() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.location.href = "/"}
                className="p-1 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img 
                src="/logo.png" 
                alt="MyBillPort Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Payments</h1>
                <p className="text-sm text-gray-600">Transaction history</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 pb-20">
        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <div>
                <h4 className="font-medium text-gray-800">Internet Bill</h4>
                <p className="text-sm text-gray-600">Paid on Jan 25, 2025</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">-$89.99</p>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
              <div>
                <h4 className="font-medium text-gray-800">Phone Bill</h4>
                <p className="text-sm text-gray-600">Paid on Jan 20, 2025</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">-$65.00</p>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <h4 className="font-medium text-gray-800">Gas Bill</h4>
                <p className="text-sm text-gray-600">Processing since Jan 28</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">-$142.30</p>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">**** 1234</p>
                  <p className="text-sm text-gray-600">Expires 12/27</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Primary</span>
            </div>

            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors">
              + Add Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-100 shadow-lg">
        <div className="grid grid-cols-4 py-1">
          <button 
            onClick={() => window.location.href = "/"}
            className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-blue-600"
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center py-3 px-4 text-blue-600">
            <CreditCard className="w-5 h-5 mb-1" />
            <span className="text-xs font-semibold">Payments</span>
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