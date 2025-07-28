import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Zap } from "lucide-react";

export default function QuickActions() {
  const { toast } = useToast();

  const scanBillMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bills/scan"),
    onSuccess: () => {
      toast({
        title: "Bill Scanned",
        description: "Bill scanning feature would open camera interface.",
      });
    },
    onError: () => {
      toast({
        title: "Scan Failed",
        description: "Failed to initialize bill scanning.",
        variant: "destructive",
      });
    },
  });

  const quickPayAction = () => {
    toast({
      title: "Quick Pay",
      description: "Quick payment modal would open here.",
    });
  };

  return (
    <div className="px-4 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => scanBillMutation.mutate()}
          disabled={scanBillMutation.isPending}
          className="bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
          <span className="font-medium">
            {scanBillMutation.isPending ? "Scanning..." : "Scan Bill"}
          </span>
        </button>
        <button
          onClick={quickPayAction}
          className="bg-green-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:bg-green-700 transition-colors"
        >
          <Zap className="w-5 h-5" />
          <span className="font-medium">Quick Pay</span>
        </button>
      </div>
    </div>
  );
}
