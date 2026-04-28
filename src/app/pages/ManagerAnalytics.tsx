import { useState } from "react";
import { Link } from "react-router";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, CheckCircle2, Users, ChevronLeft } from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

const velocityData = WEEKS.map((week, i) => ({
  week,
  completed: Math.round(8 + Math.sin(i * 0.9) * 3 + i * 0.4),
  added: Math.round(7 + Math.cos(i * 0.7) * 2 + i * 0.15),
}));

const onTimeRate = 78;

const MEMBERS = [
  { id: 1, name: "Aisha Bekova" },
  { id: 2, name: "Damir Serov" },
  { id: 3, name: "Lena Park" },
  { id: 4, name: "Rustam Aliev" },
  { id: 5, name: "Zara Nurgali" },
];

const HEATMAP_WEEKS = ["3 weeks ago", "2 weeks ago", "Last week", "This week"];

function pseudo(seed: number, w: number) {
  const x = Math.sin(seed * 17.3 + w * 43.7) * 9301.0;
  return x - Math.floor(x);
}

const heatmapData = MEMBERS.map((m) => ({
  ...m,
  weeks: HEATMAP_WEEKS.map((label, w) => ({
    label,
    tasks: Math.round(pseudo(m.id, w) * 10),
  })),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function heatColor(tasks: number): string {
  if (tasks === 0) return "bg-zinc-100 dark:bg-zinc-800";
  if (tasks <= 2) return "bg-blue-100 dark:bg-blue-950/60";
  if (tasks <= 5) return "bg-blue-300 dark:bg-blue-700/70";
  if (tasks <= 8) return "bg-blue-500 dark:bg-blue-500/80";
  return "bg-blue-700 dark:bg-blue-400";
}

function heatText(tasks: number): string {
  if (tasks === 0) return "text-zinc-400 dark:text-zinc-600";
  if (tasks <= 5) return "text-blue-700 dark:text-blue-200";
  return "text-white dark:text-white";
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function VelocityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 shadow-md text-[11px] space-y-1">
      <p className="text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-zinc-600 dark:text-zinc-400 capitalize">{p.name}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function DeliveryTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 shadow-md text-[11px]">
      <p className="text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">{payload[0].value}% on time</p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4 flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 shrink-0">
        <Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-0.5">{label}</p>
        <p className="text-[20px] font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{value}</p>
        {sub && <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-1">{title}</h2>
      {children}
    </div>
  );
}

// ── On-time delivery per week (bar) ───────────────────────────────────────────

const deliveryData = WEEKS.map((week, i) => ({
  week,
  rate: Math.min(100, Math.round(65 + Math.sin(i * 1.1 + 1) * 18 + i * 1.1)),
}));

// ── Page ──────────────────────────────────────────────────────────────────────

export function ManagerAnalytics() {
  const [activeWeek, setActiveWeek] = useState<string | null>(null);
  const avgVelocity = Math.round(velocityData.reduce((s, d) => s + d.completed, 0) / velocityData.length);
  const totalCompleted = velocityData.reduce((s, d) => s + d.completed, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/boards"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Analytics</span>
            </div>
            <p className="text-[12px] text-zinc-500 pl-6">Team performance · last 12 weeks</p>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            icon={TrendingUp}
            label="Avg. velocity / week"
            value={String(avgVelocity)}
            sub="tasks completed"
          />
          <StatCard
            icon={CheckCircle2}
            label="On-time delivery rate"
            value={`${onTimeRate}%`}
            sub="12-week average"
          />
          <StatCard
            icon={Users}
            label="Active members"
            value={String(MEMBERS.length)}
            sub="past 4 weeks"
          />
        </div>

        {/* Velocity chart */}
        <Section title="Team velocity — 12 weeks">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 pt-5 pb-3">
            <div className="flex items-center gap-4 mb-4 px-1">
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="w-2.5 h-0.5 rounded bg-zinc-900 dark:bg-zinc-100 inline-block" />
                Completed
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="w-2.5 h-0.5 rounded bg-zinc-400 dark:bg-zinc-600 inline-block border-dashed" />
                Added
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={velocityData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid, #e4e4e7)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  className="text-zinc-400 dark:text-zinc-600"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  className="text-zinc-400 dark:text-zinc-600"
                />
                <Tooltip content={<VelocityTooltip />} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#18181b"
                  strokeWidth={1.5}
                  dot={{ r: 2.5, fill: "#18181b", strokeWidth: 0 }}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  className="dark:[stroke:#e4e4e7]"
                />
                <Line
                  type="monotone"
                  dataKey="added"
                  name="Added"
                  stroke="#a1a1aa"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* On-time delivery */}
        <Section title="On-time delivery rate — 12 weeks">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 pt-5 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={deliveryData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid, #e4e4e7)" strokeOpacity={0.5} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  className="text-zinc-400 dark:text-zinc-600"
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  className="text-zinc-400 dark:text-zinc-600"
                />
                <Tooltip content={<DeliveryTooltip />} />
                <Bar
                  dataKey="rate"
                  radius={[3, 3, 0, 0]}
                  fill="#18181b"
                  className="dark:fill-zinc-100 opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Workload heatmap */}
        <Section title="Workload heatmap — per employee · last 4 weeks">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            {/* Column headers */}
            <div className="grid border-b border-zinc-100 dark:border-zinc-800" style={{ gridTemplateColumns: "160px repeat(4, 1fr)" }}>
              <div className="px-4 py-2.5" />
              {HEATMAP_WEEKS.map((w) => (
                <div key={w} className="px-3 py-2.5 text-[11px] text-zinc-400 dark:text-zinc-600 text-center">
                  {w}
                </div>
              ))}
            </div>

            {/* Rows */}
            {heatmapData.map((member, ri) => (
              <div
                key={member.id}
                className={`grid ${ri < heatmapData.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800/60" : ""}`}
                style={{ gridTemplateColumns: "160px repeat(4, 1fr)" }}
              >
                <div className="px-4 py-3 flex items-center">
                  <span className="text-[12px] text-zinc-700 dark:text-zinc-300 truncate">{member.name}</span>
                </div>
                {member.weeks.map((cell) => (
                  <div key={cell.label} className="px-2 py-2.5 flex items-center justify-center">
                    <div
                      className={`w-full max-w-[64px] h-9 rounded flex items-center justify-center text-[12px] font-medium transition-all ${heatColor(cell.tasks)} ${heatText(cell.tasks)}`}
                      title={`${cell.tasks} tasks`}
                    >
                      {cell.tasks}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Legend */}
            <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-600 mr-1">Tasks</span>
              {[
                { label: "0", cls: "bg-zinc-100 dark:bg-zinc-800" },
                { label: "1–2", cls: "bg-blue-100 dark:bg-blue-950/60" },
                { label: "3–5", cls: "bg-blue-300 dark:bg-blue-700/70" },
                { label: "6–8", cls: "bg-blue-500 dark:bg-blue-500/80" },
                { label: "9+", cls: "bg-blue-700 dark:bg-blue-400" },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className={`w-3 h-3 rounded-sm ${l.cls}`} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
