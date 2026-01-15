import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Loader2, Zap, Wifi, Phone, CreditCard, FileText, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Bill {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  billType: "hydro" | "internet" | "phone" | "subscription" | "other";
  isPaid: number;
}

type BillStatus = "upcoming" | "due-soon" | "overdue";

function getBillStatus(dueDate: string): BillStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "due-soon";
  return "upcoming";
}

function getStatusColor(status: BillStatus): string {
  switch (status) {
    case "overdue": return "bg-red-500";
    case "due-soon": return "bg-yellow-500";
    case "upcoming": return "bg-green-500";
  }
}

function getStatusLabel(status: BillStatus): string {
  switch (status) {
    case "overdue": return "Overdue";
    case "due-soon": return "Due Soon";
    case "upcoming": return "Upcoming";
  }
}

function getBillIcon(billType: string) {
  switch (billType) {
    case "hydro": return <Zap className="w-5 h-5" />;
    case "internet": return <Wifi className="w-5 h-5" />;
    case "phone": return <Phone className="w-5 h-5" />;
    case "subscription": return <CreditCard className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function MVPDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBills = async () => {
      try {
        const response = await fetch("/api/bills");
        if (!response.ok) throw new Error("Failed to fetch bills");
        const data = await response.json();
        if (mounted) {
          setBills(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load bills");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadBills();
    return () => { mounted = false; };
  }, []);

  const handleMarkPaid = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to mark as paid");
      setBills(prev => prev.map(b => b.id === billId ? { ...b, isPaid: 1 } : b));
      toast({ title: "Bill marked as paid" });
    } catch {
      toast({ title: "Error", description: "Failed to update bill", variant: "destructive" });
    }
  };

  const unpaidBills = bills.filter(b => b.isPaid === 0);
  const paidBills = bills.filter(b => b.isPaid === 1);
  
  const sortedBills = [...unpaidBills].sort((a, b) => {
    const statusOrder = { overdue: 0, "due-soon": 1, upcoming: 2 };
    const statusA = getBillStatus(a.dueDate);
    const statusB = getBillStatus(b.dueDate);
    return statusOrder[statusA] - statusOrder[statusB];
  });

  const overdueBills = unpaidBills.filter(b => getBillStatus(b.dueDate) === "overdue");

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Bills</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 px-6 pt-12 pb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-teal-600 font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-white">MyBillPort</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Your Bills</h1>
        </div>

        <div className="px-4 -mt-4">
          {/* Monthly Snapshot */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">This Month</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
                <p className="text-xs text-gray-500">Total Bills</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{paidBills.length}</p>
                <p className="text-xs text-gray-500">Paid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{overdueBills.length}</p>
                <p className="text-xs text-gray-500">Missed</p>
              </div>
            </div>
          </div>

          {/* Bills List */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Bills</h2>
            <Link href="/add-bill-simple">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-1" /> Add Bill
              </Button>
            </Link>
          </div>

          {sortedBills.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">All caught up!</h3>
              <p className="text-gray-500 text-sm mb-4">No unpaid bills</p>
              <Link href="/add-bill-simple">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Bill
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBills.map(bill => {
                const status = getBillStatus(bill.dueDate);
                return (
                  <div key={bill.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      status === "overdue" ? "bg-red-100 text-red-600" :
                      status === "due-soon" ? "bg-yellow-100 text-yellow-600" :
                      "bg-green-100 text-green-600"
                    }`}>
                      {getBillIcon(bill.billType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{bill.name}</p>
                      <p className="text-sm text-gray-500">Due {formatDate(bill.dueDate)}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-semibold text-gray-900">${Number(bill.amount).toFixed(2)}</p>
                      <div className="flex items-center justify-end mt-1">
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${getStatusColor(status)}`}></span>
                        <span className={`text-xs font-medium ${
                          status === "overdue" ? "text-red-600" :
                          status === "due-soon" ? "text-yellow-600" :
                          "text-green-600"
                        }`}>{getStatusLabel(status)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkPaid(bill.id)}
                      className="ml-3 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark as paid"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paid Bills Section */}
          {paidBills.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Paid This Month</h2>
              <div className="space-y-2">
                {paidBills.map(bill => (
                  <div key={bill.id} className="bg-gray-100 rounded-xl p-4 flex items-center opacity-60">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-400">
                      {getBillIcon(bill.billType)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-600 line-through">{bill.name}</p>
                    </div>
                    <p className="font-medium text-gray-500">${Number(bill.amount).toFixed(2)}</p>
                    <CheckCircle className="w-5 h-5 text-green-500 ml-3" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
