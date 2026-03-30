import { Sparkles } from "lucide-react";
import { Insight } from "../data/mockData";

interface AIInsightsProps {
  insights: Insight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className="space-y-2">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className="flex items-start gap-2 px-3 py-2 rounded-md bg-zinc-900/30 border border-zinc-800/50"
        >
          <Sparkles className="w-3 h-3 text-violet-400 mt-0.5 shrink-0" />
          <span className="text-[12px] text-zinc-400">{insight.text}</span>
        </div>
      ))}
    </div>
  );
}
