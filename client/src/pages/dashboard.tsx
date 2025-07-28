import { useQuery } from "@tanstack/react-query";
import { Bell, Bot } from "lucide-react";
import BillItem from "@/components/bill-item";
import SummaryCard from "@/components/summary-card";
import QuickActions from "@/components/quick-actions";
import BottomNavigation from "@/components/bottom-navigation";
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
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white text-lg"></i>
            </div>
            <div>
              <h1 className="font-semibold text-lg">John Doe</h1>
              <p className="text-white/80 text-sm">Welcome back!</p>
            </div>
          </div>
          <div className="relative">
            <button className="relative p-2">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 pb-20 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* AI Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">AI Reminder</h3>
                <p className="text-sm text-gray-600">
                  Your electricity bill is due in 2 days. Set up autopay?
                </p>
              </div>
              <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Summary Card */}
          <SummaryCard
            totalOutstanding={totalOutstanding}
            priorityCounts={priorityCounts}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Bills List */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Bills</h3>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>

          <div className="space-y-3">
            {bills.map((bill) => (
              <BillItem key={bill.id} bill={bill} />
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </>
  );
}
