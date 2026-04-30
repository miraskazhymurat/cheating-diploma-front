import { TrendingUp, TrendingDown } from "lucide-react";
import { usePointsHistory } from "../../hooks/useGamification";
import { REASON_LABELS } from "../../api/gamification";

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface PointsHistoryProps {
  className?: string;
}

export function PointsHistory({ className = "" }: PointsHistoryProps) {
  const { data: history = [], isLoading } = usePointsHistory();

  if (isLoading) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-[12px] text-zinc-400 dark:text-zinc-600 italic px-1">
        No point activity yet. Complete a task to earn your first points!
      </p>
    );
  }

  return (
    <div className={`space-y-px ${className}`}>
      {history.map((tx) => {
        const isPositive = tx.points > 0;
        const label = REASON_LABELS[tx.reason] ?? tx.reason;
        return (
          <div
            key={tx.id}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              isPositive ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-red-50 dark:bg-red-950/40"
            }`}>
              {isPositive
                ? <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                : <TrendingDown className="w-2.5 h-2.5 text-red-500" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-tight truncate block">
                {label}
              </span>
              {tx.task_id && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">task #{tx.task_id}</span>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className={`text-[12px] font-semibold tabular-nums ${
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
              }`}>
                {isPositive ? "+" : ""}{tx.points}
              </span>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-600">
                {formatRelative(tx.earned_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
