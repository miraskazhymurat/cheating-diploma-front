import { Flame, TrendingUp, ChevronRight } from "lucide-react";
import { BurnoutAlert, PromotionCandidate, RiskLevel } from "../data/mockData";

interface AIInsightsProps {
  burnoutAlerts: BurnoutAlert[];
  promotionCandidates: PromotionCandidate[];
}

const RISK_CONFIG: Record<RiskLevel, { bar: string; badge: string; label: string }> = {
  critical: {
    bar: "bg-red-500",
    badge: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40",
    label: "Critical",
  },
  high: {
    bar: "bg-orange-400",
    badge: "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40",
    label: "High",
  },
  medium: {
    bar: "bg-amber-400",
    badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40",
    label: "Medium",
  },
  low: {
    bar: "bg-emerald-400",
    badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40",
    label: "Low",
  },
};

const SCORE_META: Record<
  keyof PromotionCandidate["scores"],
  { label: string; bar: string }
> = {
  performance: { label: "Perf", bar: "bg-violet-400" },
  delivery:    { label: "Delivery", bar: "bg-blue-400" },
  collaboration: { label: "Collab", bar: "bg-emerald-400" },
  impact:      { label: "Impact", bar: "bg-amber-400" },
};

export function AIInsights({ burnoutAlerts, promotionCandidates }: AIInsightsProps) {
  return (
    <div className="space-y-6">
      {/* ── Burnout Risk ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <Flame className="w-3 h-3 text-orange-400" />
          <span className="text-[12px] text-zinc-500 dark:text-zinc-400">Burnout Risk</span>
        </div>

        <div className="space-y-2">
          {burnoutAlerts.map((alert) => {
            const cfg = RISK_CONFIG[alert.riskLevel];
            return (
              <div
                key={alert.id}
                className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <div className={`h-0.5 ${cfg.bar}`} />
                <div className="px-3 py-2.5">
                  {/* Name + badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">
                      {alert.employeeName}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Signals */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {alert.signals.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Interventions */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 space-y-0.5">
                    {alert.interventions.map((text) => (
                      <p
                        key={text}
                        className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1"
                      >
                        <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-zinc-400" />
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Promotion Readiness ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <TrendingUp className="w-3 h-3 text-violet-400" />
          <span className="text-[12px] text-zinc-500 dark:text-zinc-400">Promotion Ready</span>
        </div>

        <div className="space-y-2">
          {promotionCandidates.map((c) => (
            <div
              key={c.id}
              className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5"
            >
              {/* Name + total */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">
                  {c.employeeName}
                </span>
                <span className="text-[12px] font-semibold text-violet-600 dark:text-violet-400">
                  {c.total}
                </span>
              </div>

              {/* Score bars */}
              <div className="space-y-1.5">
                {(Object.keys(c.scores) as (keyof typeof c.scores)[]).map((key) => {
                  const { label, bar } = SCORE_META[key];
                  const val = c.scores[key];
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600 w-12 shrink-0">
                        {label}
                      </span>
                      <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${bar}`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 w-5 text-right tabular-nums">
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
