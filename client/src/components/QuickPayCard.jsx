import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle } from "lucide-react";
import PayButton from "./PayButton";

export default function QuickPayCard({ bill }) {
  if (!bill || bill.isPaid === 1) return null;

  const getBillIcon = (iconName) => {
    switch (iconName) {
      case '⚡': return <span className="text-2xl">⚡</span>;
      case '📱': return <span className="text-2xl">📱</span>;
      case '💳': return <span className="text-2xl">💳</span>;
      case '🏠': return <span className="text-2xl">🏠</span>;
      default: return <Calendar className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDaysUntilDue = () => {
    const now = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { text: `${Math.abs(daysDiff)} days overdue`, color: "text-red-600", urgent: true };
    } else if (daysDiff <= 3) {
      return { text: `Due in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`, color: "text-orange-600", urgent: true };
    } else {
      return { text: `Due in ${daysDiff} days`, color: "text-gray-600", urgent: false };
    }
  };

  const dueInfo = getDaysUntilDue();

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              {getBillIcon(bill.icon)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {bill.name}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {bill.company}
              </p>
            </div>
          </div>
          <Badge className={getPriorityColor(bill.priority)}>
            {bill.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              ${parseFloat(bill.amount).toFixed(2)}
            </div>
            <div className={`flex items-center gap-1 ${dueInfo.color}`}>
              {dueInfo.urgent && <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{dueInfo.text}</span>
            </div>
          </div>
          
          <PayButton bill={bill} />
        </div>
      </CardContent>
    </Card>
  );
}