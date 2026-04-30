import { TrendingUp, TrendingDown, Heart } from "lucide-react";
import { usePointsHistory, useReceivedKudos } from "../../hooks/useGamification";
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
  boardId: number;
  className?: string;
}

export function PointsHistory({ boardId, className = "" }: PointsHistoryProps) {
  const { data: history = [], isLoading: loadingHistory } = usePointsHistory(boardId);
  const { data: kudos = [], isLoading: loadingKudos } = useReceivedKudos();

  const isLoading = loadingHistory || loadingKudos;

  if (isLoading) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Points feed */}
      <div>
        <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide px-1 mb-1.5">
          Points activity
        </p>
        {history.length === 0 ? (
          <p className="text-[12px] text-zinc-400 dark:text-zinc-600 italic px-1">
            No point activity yet. Complete a task to earn your first points!
          </p>
        ) : (
          <div className="space-y-px">
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
        )}
      </div>

      {/* Kudos received */}
      <div>
        <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide px-1 mb-1.5">
          Kudos received
        </p>
        {kudos.length === 0 ? (
          <p className="text-[12px] text-zinc-400 dark:text-zinc-600 italic px-1">
            No kudos yet. Keep up the great work!
          </p>
        ) : (
          <div className="space-y-px">
            {kudos.map((k) => (
              <div
                key={k.id}
                className="flex items-start gap-2 px-2.5 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-pink-50 dark:bg-pink-950/40">
                  <Heart className="w-2.5 h-2.5 text-pink-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-tight block">
                    <span className="font-medium">{k.from_name || `User #${k.from_user_id}`}</span>
                    {" "}sent you kudos
                  </span>
                  {k.message && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      "{k.message}"
                    </p>
                  )}
                  {k.task_id && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600">task #{k.task_id}</span>
                  )}
                </div>

                <div className="text-[10px] text-zinc-400 dark:text-zinc-600 shrink-0 mt-0.5">
                  {formatRelative(k.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
