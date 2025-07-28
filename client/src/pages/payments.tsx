import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "../components/bottom-navigation";
import { Payment } from "@shared/schema";
import { format } from "date-fns";

export default function Payments() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

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
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600">
              <path fill="currentColor" d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1ZM10 6a2 2 0 0 1 4 0v1h-4V6Zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10Z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold">MyBillPort</h1>
        </div>
        <h2 className="text-lg font-semibold">Payments</h2>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto bg-gray-50">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-receipt text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-500">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <i className="fas fa-check text-green-600 text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Payment Completed</h4>
                      <p className="text-sm text-gray-500">
                        {format(new Date(payment.paymentDate!), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${payment.amount}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation activeTab="payments" />
    </>
  );
}
