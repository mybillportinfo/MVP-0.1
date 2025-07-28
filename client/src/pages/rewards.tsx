import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import { Reward } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Gift } from "lucide-react";

export default function Rewards() {
  const { data: rewards = [], isLoading } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => apiRequest("POST", `/api/rewards/${rewardId}/redeem`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      toast({
        title: "Reward Redeemed!",
        description: "Your reward has been successfully redeemed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  const totalPoints = rewards.reduce((total, reward) => {
    return reward.isRedeemed === 0 ? total + reward.points : total;
  }, 0);

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
          <h1 className="text-xl font-semibold">Rewards</h1>
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span className="font-bold">{totalPoints} pts</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        {/* Points Summary */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{totalPoints}</h2>
            <p className="text-yellow-100">Available Points</p>
            <p className="text-sm text-yellow-100 mt-2">
              Earn points by paying bills on time!
            </p>
          </div>
        </div>

        {/* Rewards List */}
        {rewards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards yet</h3>
            <p className="text-gray-500">Start paying bills to earn rewards!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      reward.isRedeemed === 1 ? 'bg-gray-100' : 'bg-yellow-100'
                    }`}>
                      <Gift className={`w-6 h-6 ${
                        reward.isRedeemed === 1 ? 'text-gray-400' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{reward.title}</h4>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                      <p className="text-sm font-medium text-yellow-600">{reward.points} points</p>
                    </div>
                  </div>
                  <div>
                    {reward.isRedeemed === 1 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Redeemed
                      </span>
                    ) : (
                      <button
                        onClick={() => redeemMutation.mutate(reward.id)}
                        disabled={redeemMutation.isPending}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50"
                      >
                        {redeemMutation.isPending ? "Redeeming..." : "Redeem"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation activeTab="rewards" />
    </>
  );
}
