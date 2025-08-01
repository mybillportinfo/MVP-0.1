import { useEffect, useState } from "react";
import { Home, CreditCard, Gift, User, ArrowLeft, Star, Trophy } from "lucide-react";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";

export default function Rewards() {
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
                src="/src/assets/logo.png" 
                alt="MyBillPort Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Rewards</h1>
                <p className="text-sm text-gray-600">Earn points & save money</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 pb-20">
        {/* Points Balance */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Your Points Balance</p>
              <p className="text-3xl font-bold">2,450</p>
              <p className="text-blue-100 text-sm">= $24.50 value</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Star className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Available Rewards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Rewards</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">$5 Bill Credit</h4>
                  <p className="text-sm text-gray-600">500 points required</p>
                </div>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                Redeem
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Gift className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">$10 Bill Credit</h4>
                  <p className="text-sm text-gray-600">1000 points required</p>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Redeem
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Premium Features</h4>
                  <p className="text-sm text-gray-600">2500 points required</p>
                </div>
              </div>
              <button className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                Soon
              </button>
            </div>
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Earn Points</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">+10</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Pay bills on time</p>
                <p className="text-sm text-gray-600">Earn 10 points per payment</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">+25</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Set up autopay</p>
                <p className="text-sm text-gray-600">One-time bonus for automation</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">+50</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Refer friends</p>
                <p className="text-sm text-gray-600">When they make their first payment</p>
              </div>
            </div>
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
          <button 
            onClick={() => window.location.href = "/payments"}
            className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-blue-600"
          >
            <CreditCard className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Payments</span>
          </button>
          <button className="flex flex-col items-center py-3 px-4 text-blue-600">
            <Gift className="w-5 h-5 mb-1" />
            <span className="text-xs font-semibold">Rewards</span>
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