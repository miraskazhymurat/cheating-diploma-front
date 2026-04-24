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
          className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40"
        >
          <Sparkles className="w-3 h-3 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0" />
          <span className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{insight.text}</span>
        </div>
      ))}
    </div>
  );
}
