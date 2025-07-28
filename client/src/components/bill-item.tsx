import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bill } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";

interface BillItemProps {
  bill: Bill;
}

export default function BillItem({ bill }: BillItemProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const payBillMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bills/${bill.id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      toast({
        title: "Payment Successful!",
        description: `Your ${bill.name} has been paid successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getDueDateText = () => {
    const daysUntilDue = differenceInDays(new Date(bill.dueDate), new Date());
    
    if (daysUntilDue < 0) {
      return "Overdue";
    } else if (daysUntilDue === 0) {
      return "Due: Today";
    } else if (daysUntilDue === 1) {
      return "Due: Tomorrow";
    } else {
      return `Due: In ${daysUntilDue} days`;
    }
  };

  const getPriorityClasses = () => {
    switch (bill.priority) {
      case "urgent":
        return {
          border: "border-l-red-600",
          iconBg: "bg-red-50",
          iconText: "text-red-600",
          dueDateText: "text-red-600",
          buttonBg: "bg-red-600 hover:bg-red-700"
        };
      case "medium":
        return {
          border: "border-l-orange-500",
          iconBg: "bg-orange-50",
          iconText: "text-orange-600",
          dueDateText: "text-orange-600",
          buttonBg: "bg-orange-500 hover:bg-orange-600"
        };
      case "low":
        return {
          border: "border-l-green-600",
          iconBg: "bg-green-50",
          iconText: "text-green-600",
          dueDateText: "text-green-600",
          buttonBg: "bg-green-600 hover:bg-green-700"
        };
      default:
        return {
          border: "border-l-gray-600",
          iconBg: "bg-gray-50",
          iconText: "text-gray-600",
          dueDateText: "text-gray-600",
          buttonBg: "bg-gray-600 hover:bg-gray-700"
        };
    }
  };

  const classes = getPriorityClasses();

  if (bill.isPaid === 1) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-gray-300 p-4 opacity-75">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <i className={`${bill.icon} text-gray-400 text-lg`}></i>
            </div>
            <div>
              <h4 className="font-semibold text-gray-500">{bill.name}</h4>
              <p className="text-sm text-gray-400">{bill.company}</p>
              <p className="text-xs text-green-600 font-medium">Paid</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-500">${bill.amount}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
              ✓ Paid
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${classes.border} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${classes.iconBg} rounded-xl flex items-center justify-center`}>
            <i className={`${bill.icon} ${classes.iconText} text-lg`}></i>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{bill.name}</h4>
            <p className="text-sm text-gray-600">{bill.company}</p>
            <p className={`text-xs ${classes.dueDateText} font-medium`}>
              {getDueDateText()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-800">${bill.amount}</p>
          <button
            onClick={() => payBillMutation.mutate()}
            disabled={payBillMutation.isPending}
            className={`${classes.buttonBg} text-white px-4 py-2 rounded-lg text-sm font-medium mt-2 transition-colors disabled:opacity-50`}
          >
            {payBillMutation.isPending ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
