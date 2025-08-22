import { useBills, useBillsFiltered } from "@/hooks/useBills";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Phone, Zap, Home, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import PayButton from "./PayButton";

interface BillsListProps {
  filter?: 'all' | 'overdue' | 'due-soon' | 'unpaid' | 'paid';
  showPayButton?: boolean;
}

export default function BillsList({ filter = 'all', showPayButton = true }: BillsListProps) {
  const { bills, isLoading, error } = useBillsFiltered(filter);

  const getBillIcon = (iconName: string) => {
    switch (iconName) {
      case '⚡': return <Zap className="w-5 h-5" />;
      case '📱': return <Phone className="w-5 h-5" />;
      case '💳': return <CreditCard className="w-5 h-5" />;
      case '🏠': return <Home className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusInfo = (bill: any) => {
    if (bill.isPaid === 1) {
      return { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: "Paid", color: "text-green-600" };
    }
    
    const now = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { icon: <AlertCircle className="w-4 h-4 text-red-600" />, text: `${Math.abs(daysDiff)} days overdue`, color: "text-red-600" };
    } else if (daysDiff <= 7) {
      return { icon: <AlertCircle className="w-4 h-4 text-orange-600" />, text: `Due in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`, color: "text-orange-600" };
    } else {
      return { icon: <Calendar className="w-4 h-4 text-gray-600" />, text: `Due in ${daysDiff} days`, color: "text-gray-600" };
    }
  };

  // Remove handlePayBill - now using PayButton component

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading bills...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Failed to load bills. Please try again.</p>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No bills found</p>
        <p className="text-sm">
          {filter === 'paid' ? 'No paid bills yet' : 'Add your first bill to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bills.map((bill) => {
        const statusInfo = getStatusInfo(bill);
        
        return (
          <Card key={bill.id} className="border-0 shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">
                    {getBillIcon(bill.icon)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100" data-testid={`text-bill-name-${bill.id}`}>
                        {bill.name}
                      </h3>
                      <Badge className={getPriorityColor(bill.priority)} data-testid={`badge-priority-${bill.id}`}>
                        {bill.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-company-${bill.id}`}>
                      {bill.company}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100" data-testid={`text-amount-${bill.id}`}>
                        ${parseFloat(bill.amount).toFixed(2)}
                      </span>
                      
                      <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="text-sm" data-testid={`text-status-${bill.id}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1" data-testid={`text-due-date-${bill.id}`}>
                      Due: {new Date(bill.dueDate).toLocaleDateString('en-CA')}
                    </p>
                  </div>
                </div>
                
                {showPayButton && (
                  <PayButton bill={bill} size="sm" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}