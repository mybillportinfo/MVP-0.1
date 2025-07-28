interface SummaryCardProps {
  totalOutstanding: number;
  priorityCounts: {
    urgent: number;
    medium: number;
    low: number;
  };
}

export default function SummaryCard({ totalOutstanding, priorityCounts }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Outstanding</span>
          <span className="text-2xl font-bold text-red-600">
            ${totalOutstanding.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-red-600 font-semibold">{priorityCounts.urgent}</div>
            <div className="text-xs text-gray-600">Urgent</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-orange-600 font-semibold">{priorityCounts.medium}</div>
            <div className="text-xs text-gray-600">Medium</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-green-600 font-semibold">{priorityCounts.low}</div>
            <div className="text-xs text-gray-600">Low</div>
          </div>
        </div>
      </div>
    </div>
  );
}
