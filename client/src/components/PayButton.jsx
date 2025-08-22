import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PayButton({ bill, className = "", size = "default" }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onPay = async () => {
    if (!bill) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: bill.id,
          billName: bill.name,
          amount: parseFloat(bill.amount),
          email: bill.userEmail || "customer@example.com", // or current user email
        }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Could not start checkout");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Could not start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for paid bills
  if (bill?.isPaid === 1) {
    return null;
  }

  return (
    <Button
      onClick={onPay}
      disabled={isLoading || !bill}
      className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      size={size}
      data-testid={`button-pay-${bill?.id}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Pay ${parseFloat(bill?.amount || 0).toFixed(2)}
        </>
      )}
    </Button>
  );
}