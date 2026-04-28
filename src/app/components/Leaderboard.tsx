import { Flame, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import type { EmployeeResponse } from "../../api/types";

// ── Level config ──────────────────────────────────────────────────────────────

const LEVELS = [
  { min: 0,    max: 99,         n: 1, name: "Novice",      color: "text-zinc-500 dark:text-zinc-400",    bg: "bg-zinc-100 dark:bg-zinc-800",           bar: "bg-zinc-400" },
  { min: 100,  max: 299,        n: 2, name: "Contributor", color: "text-sky-600 dark:text-sky-400",      bg: "bg-sky-50 dark:bg-sky-950/50",           bar: "bg-sky-400" },
  { min: 300,  max: 699,        n: 3, name: "Performer",   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", bar: "bg-emerald-400" },
  { min: 700,  max: 1499,       n: 4, name: "Expert",      color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50",    bar: "bg-violet-400" },
  { min: 1500, max: 2999,       n: 5, name: "Elite",       color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/50",       bar: "bg-amber-400" },
  { min: 3000, max: Infinity,   n: 6, name: "Legend",      color: "text-red-500 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-950/50",           bar: "bg-red-400" },
];

function getLevel(pts: number) {
  return LEVELS.find((l) => pts >= l.min && pts <= l.max) ?? LEVELS[0];
}

function nextLevel(pts: number) {
  return LEVELS.find((l) => l.min > pts) ?? null;
}

// ── Trophies ──────────────────────────────────────────────────────────────────

const TROPHIES = [
  { id: "first",   icon: "⚔️",  name: "First Blood",  earned: (pts: number, _s: number) => pts >= 10 },
  { id: "roll",    icon: "🔥",  name: "On a Roll",     earned: (_p: number, s: number) => s >= 5 },
  { id: "stop",    icon: "⚡",  name: "Unstoppable",   earned: (_p: number, s: number) => s >= 20 },
  { id: "perf",    icon: "⭐",  name: "Performer",     earned: (pts: number, _s: number) => pts >= 300 },
  { id: "exp",     icon: "💎",  name: "Expert",        earned: (pts: number, _s: number) => pts >= 700 },
  { id: "elite",   icon: "👑",  name: "Elite",         earned: (pts: number, _s: number) => pts >= 1500 },
  { id: "legend",  icon: "🏆",  name: "Legend",        earned: (pts: number, _s: number) => pts >= 3000 },
];

// ── Point rules ───────────────────────────────────────────────────────────────

const POINT_RULES = [
  { event: "Task completed",        pts: "+10",  note: "Base" },
  { event: "On-time bonus",         pts: "+5",   note: "Before due date" },
  { event: "Quality bonus",         pts: "+3",   note: "No reopens / 5 days" },
  { event: "Complexity multiplier", pts: "×1–2", note: "e.g. ×1.7 for score 7" },
  { event: "Streak bonus",          pts: "+2/d", note: "After 3 consecutive days" },
  { event: "Weekly milestone",      pts: "+10",  note: "Every 5-day streak" },
  { event: "Peer kudos",            pts: "+5",   note: "@mention praise" },
];

// ── Deterministic score generation ───────────────────────────────────────────

function pseudoRand(seed: number, offset: number) {
  const x = Math.sin(seed * 127.1 + offset * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface GEntry {
  emp: EmployeeResponse;
  pts30d: number;
  totalPts: number;
  streak: number;
}

function buildEntries(employees: EmployeeResponse[]): GEntry[] {
  return employees
    .map((emp) => {
      const s = emp.user_id;
      return {
        emp,
        pts30d:   Math.round(150 + pseudoRand(s, 10) * 1050),
        totalPts: Math.round(200 + pseudoRand(s, 11) * 2800),
        streak:   Math.round(pseudoRand(s, 12) * 21),
      };
    })
    .sort((a, b) => b.pts30d - a.pts30d);
}

// ── Small avatar ──────────────────────────────────────────────────────────────

function Avatar({ photo, name, size }: { photo?: string; name: string; size: number }) {
  const cls = `rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700`;
  const style = { width: size, height: size };
  if (photo) return <img src={photo} alt="" className={cls} style={style} />;
  return (
    <div
      className="rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0"
      style={style}
    >
      <span className="text-[9px] font-medium text-zinc-600 dark:text-zinc-300">{name.charAt(0)}</span>
    </div>
  );
}

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

// ── Main component ────────────────────────────────────────────────────────────

interface LeaderboardProps {
  employees: EmployeeResponse[];
  currentUserId?: number;
}

export function Leaderboard({ employees, currentUserId }: LeaderboardProps) {
  const [showRules, setShowRules] = useState(false);
  const entries = useMemo(() => buildEntries(employees), [employees]);

  const me = entries.find((e) => e.emp.user_id === currentUserId);
  const myRank = entries.findIndex((e) => e.emp.user_id === currentUserId) + 1;
  const myLvl = me ? getLevel(me.totalPts) : null;
  const myNext = me ? nextLevel(me.totalPts) : null;
  const myProgress = me && myLvl && myNext
    ? ((me.totalPts - myLvl.min) / (myNext.min - myLvl.min)) * 100
    : 100;

  if (employees.length === 0) {
    return <p className="text-[12px] text-zinc-400 italic px-3">No members</p>;
  }

  return (
    <div className="space-y-5">

      {/* ── My stats card ─────────────────────────────────────────────────── */}
      {me && myLvl && (
        <div className="mx-3 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* level banner */}
          <div className={`px-3 py-2 flex items-center justify-between ${myLvl.bg}`}>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">LV.{myLvl.n}</span>
              <span className={`text-[12px] font-bold ${myLvl.color}`}>{myLvl.name}</span>
            </div>
            {myRank > 0 && (
              <span className="text-[12px]">
                {RANK_MEDAL[myRank - 1] ?? `#${myRank}`}
              </span>
            )}
          </div>

          <div className="px-3 py-2.5 bg-white dark:bg-zinc-900/60">
            {/* pts + streak */}
            <div className="flex items-end justify-between mb-2.5">
              <div className="leading-none">
                <span className="text-[22px] font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
                  {me.totalPts.toLocaleString()}
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-1">pts</span>
              </div>
              <div className="flex items-center gap-1 text-orange-500 mb-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[13px] font-semibold tabular-nums">{me.streak}</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">day streak</span>
              </div>
            </div>

            {/* XP progress bar */}
            {myNext ? (
              <>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${myLvl.bar}`}
                    style={{ width: `${Math.min(100, myProgress)}%`, transition: "width 1s ease" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-600">
                  <span>{myLvl.name}</span>
                  <span className="tabular-nums">{me.totalPts.toLocaleString()} / {myNext.min.toLocaleString()}</span>
                  <span>{myNext.name}</span>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-amber-500 font-semibold text-center py-0.5">Max level — Legend 🏆</p>
            )}

            {/* trophies */}
            <div className="mt-3 flex items-center gap-1 flex-wrap">
              {TROPHIES.map((t) => {
                const earned = t.earned(me.totalPts, me.streak);
                return (
                  <span
                    key={t.id}
                    title={t.name}
                    className={`text-[15px] leading-none select-none transition-all ${earned ? "" : "opacity-15 grayscale"}`}
                  >
                    {t.icon}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 30-day rolling leaderboard ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">30-day ranking</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{entries.length} members</span>
        </div>

        <div className="space-y-px">
          {entries.map((entry, idx) => {
            const isMe = entry.emp.user_id === currentUserId;
            const lvl = getLevel(entry.totalPts);
            return (
              <Link
                key={entry.emp.user_id}
                to={`/profile/${entry.emp.user_id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isMe
                    ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                {/* rank */}
                <span className="w-5 text-center text-[12px] shrink-0">
                  {idx < 3 ? RANK_MEDAL[idx] : <span className="text-zinc-400 dark:text-zinc-600 text-[11px] font-semibold">{idx + 1}</span>}
                </span>

                <Avatar photo={entry.emp.photo} name={entry.emp.full_name} size={22} />

                {/* name + level + streak */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[12px] font-medium truncate ${isMe ? "text-violet-700 dark:text-violet-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                      {isMe ? "You" : entry.emp.full_name.split(" ")[0]}
                    </span>
                    <span className={`text-[9px] font-semibold px-1 rounded shrink-0 ${lvl.bg} ${lvl.color}`}>
                      {lvl.name}
                    </span>
                  </div>
                  {entry.streak >= 3 && (
                    <div className="flex items-center gap-0.5 text-orange-400">
                      <Flame className="w-2.5 h-2.5" />
                      <span className="text-[10px] tabular-nums">{entry.streak}d</span>
                    </div>
                  )}
                </div>

                {/* 30-day pts */}
                <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums shrink-0">
                  {entry.pts30d.toLocaleString()}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Point rules (collapsible) ─────────────────────────────────────── */}
      <div className="px-3">
        <button
          onClick={() => setShowRules((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors w-full"
        >
          <Star className="w-3 h-3" />
          How points are earned
          <span className="ml-auto text-[10px]">{showRules ? "▲" : "▼"}</span>
        </button>

        {showRules && (
          <div className="mt-2 rounded-md border border-zinc-100 dark:border-zinc-800 overflow-hidden text-[11px]">
            {POINT_RULES.map((r, i) => (
              <div
                key={i}
                className={`flex items-start justify-between px-2.5 py-1.5 gap-2 ${
                  i % 2 === 0 ? "bg-zinc-50 dark:bg-zinc-900/50" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="text-zinc-700 dark:text-zinc-300 leading-tight">{r.event}</div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-600">{r.note}</div>
                </div>
                <span className="font-semibold text-violet-600 dark:text-violet-400 shrink-0">{r.pts}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
