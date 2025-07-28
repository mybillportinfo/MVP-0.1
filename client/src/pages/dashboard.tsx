import { useQuery } from "@tanstack/react-query";
import { Bell, Bot } from "lucide-react";
import BillItem from "../components/bill-item";
import SummaryCard from "../components/summary-card";
import QuickActions from "../components/quick-actions";
import BottomNavigation from "../components/bottom-navigation";
import { Bill } from "@shared/schema";

export default function Dashboard() {
  const { data: bills = [], isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  const totalOutstanding = bills
    .filter(bill => bill.isPaid === 0)
    .reduce((total, bill) => total + parseFloat(bill.amount), 0);

  const priorityCounts = bills.reduce(
    (counts, bill) => {
      if (bill.isPaid === 0) {
        counts[bill.priority]++;
      }
      return counts;
    },
    { urgent: 0, medium: 0, low: 0 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-600">
                <path fill="currentColor" d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1ZM10 6a2 2 0 0 1 4 0v1h-4V6Zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10Z"/>
                <circle cx="12" cy="15" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-xl">MyBillPort</h1>
              <p className="text-blue-100 text-sm">Welcome back</p>
            </div>
          </div>
          <div className="relative">
            <button className="relative p-2">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
        
        {/* Total Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <p className="text-blue-100 text-sm font-medium">Total Balance</p>
          <p className="text-white text-3xl font-bold">${totalOutstanding.toFixed(2)}</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-y-auto bg-gray-50">
        <div className="px-4 pt-6 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 shadow-sm hover:bg-green-600 transition-colors font-medium">
              <span>Pay All</span>
            </button>
            <button className="bg-white text-gray-700 p-4 rounded-2xl flex items-center justify-center space-x-2 shadow-sm hover:bg-gray-50 transition-colors border border-gray-200 font-medium">
              <span>Scan Bill</span>
            </button>
          </div>

          {/* Bills List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Your Bills</h3>
              <button className="text-blue-600 text-sm font-medium">View All</button>
            </div>

            <div className="space-y-3">
              {bills.map((bill) => (
                <BillItem key={bill.id} bill={bill} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </>
  );
}
