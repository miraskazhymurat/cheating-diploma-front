import { useEffect, useRef, useState } from "react";
import { Activity, Camera, ChevronLeft, ChevronRight, Lock, Trophy, User } from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useMe, useUpdateEmployee, useEmployeeActivities, useEmployeeProfile } from "../../hooks/useEmployee";
import { useAuth } from "../context/AuthContext";

const getActivityColor = (level: number) => {
  if (level === 0) return "bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800";
  if (level === 1) return "bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-900/50";
  if (level === 2) return "bg-emerald-200 border-emerald-300 dark:bg-emerald-800/40 dark:border-emerald-800/50";
  if (level === 3) return "bg-emerald-300 border-emerald-400 dark:bg-emerald-700/50 dark:border-emerald-700/60";
  return "bg-emerald-400 border-emerald-500 dark:bg-emerald-600/60 dark:border-emerald-600/70";
};

type AchievementGroup = "tasks" | "activity" | "social" | "content" | "prestige";

type Achievement = {
  id: string;
  emoji: string;
  label: string;
  group: AchievementGroup;
  levels: [string, string, string]; // desc for each level
  currentLevel: 0 | 1 | 2 | 3 | 4;     // 0 = locked
};

const ACHIEVEMENT_GROUPS: { key: AchievementGroup; label: string }[] = [
  { key: "tasks",    label: "Tasks"    },
  { key: "activity", label: "Activity" },
  { key: "social",   label: "Social"   },
  { key: "content",  label: "Content"  },
  { key: "prestige", label: "Prestige" },
];

const achievementList: Achievement[] = [
  { id: "closer",        emoji: "🎯", label: "Closer",        group: "tasks",    levels: ["10 tasks completed",                  "50 tasks completed",                  "200 tasks completed"              ], currentLevel: 0 },
  { id: "finisher",      emoji: "✅", label: "Finisher",      group: "tasks",    levels: ["5 tasks done before deadline",         "20 tasks done before deadline",       "50 tasks done before deadline"    ], currentLevel: 1 },
  { id: "challenger",    emoji: "⚔️", label: "Challenger",    group: "tasks",    levels: ["10 hard tasks",                        "50 hard tasks",                       "200 hard tasks"                   ], currentLevel: 2 },
  { id: "elite",         emoji: "💎", label: "Elite",         group: "tasks",    levels: ["5 very hard tasks",                    "25 very hard tasks",                  "100 very hard tasks"              ], currentLevel: 1 },
  { id: "perfectionist", emoji: "🏆", label: "Perfectionist", group: "tasks",    levels: ["5 tasks without reopen",               "20 tasks without reopen",             "50 tasks without reopen"          ], currentLevel: 3 },
  { id: "cleanworker",   emoji: "📋", label: "Clean Worker",  group: "tasks",    levels: ["10 tasks with full desc + files",      "50 tasks with full desc + files",     "150 tasks with full desc + files" ], currentLevel: 3 },
  { id: "consistency",   emoji: "📅", label: "Consistency",   group: "activity", levels: ["3-day streak",                         "7-day streak",                        "11-day streak"                    ], currentLevel: 1 },
  { id: "unstoppable",   emoji: "🚀", label: "Unstoppable",   group: "activity", levels: ["50 active days",                       "100 active days",                     "200 active days"                  ], currentLevel: 1 },
  { id: "onfire",        emoji: "🔥", label: "On Fire",       group: "activity", levels: ["3 streaks total",                      "7 streaks total",                     "30 streaks total"                 ], currentLevel: 2 },
  { id: "teamplayer",    emoji: "🤝", label: "Team Player",   group: "social",   levels: ["Assign tasks to 5 users",              "Assign tasks to 15 users",            "Assign tasks to 50 users"         ], currentLevel: 0 },
  { id: "reviewer",      emoji: "🔍", label: "Reviewer",      group: "social",   levels: ["Review 10 tasks",                      "Review 50 tasks",                     "Review 150 tasks"                 ], currentLevel: 0 },
  { id: "communicator",  emoji: "💬", label: "Communicator",  group: "social",   levels: ["50 messages sent",                     "200 messages sent",                   "1000 messages sent"               ], currentLevel: 0 },
  { id: "pollmaster",    emoji: "📊", label: "Poll Master",   group: "content",  levels: ["10 polls created",                     "100 polls created",                   "1000 polls created"               ], currentLevel: 0 },
  { id: "influencer",    emoji: "📣", label: "Influencer",    group: "content",  levels: ["50 replies received",                  "300 replies received",                "1000 replies received"            ], currentLevel: 0 },
  { id: "voicepioneer",  emoji: "🎙️", label: "Voice Pioneer", group: "content",  levels: ["20 voice messages",                    "100 voice messages",                  "1000 voice messages"              ], currentLevel: 0 },
  { id: "broadcaster",   emoji: "🎬", label: "Broadcaster",   group: "content",  levels: ["20 video messages",                    "100 video messages",                  "1000 video messages"              ], currentLevel: 0 },
  { id: "legend",        emoji: "👑", label: "Legend",        group: "prestige", levels: ["10 level III achievements",            "10 level III achievements",           "10 level III achievements"        ], currentLevel: 4 },
  { id: "master",        emoji: "🌟", label: "Master",        group: "prestige", levels: ["25 achievements total",                "25 achievements total",               "25 achievements total"            ], currentLevel: 4 },
  { id: "grandmaster",   emoji: "⭐", label: "Grandmaster",   group: "prestige", levels: ["50 achievements total",                "50 achievements total",               "50 achievements total"            ], currentLevel: 0 },
];

const LEVEL_STYLES = {
  0: { border: "", badge: "", icon: "" },
  1: { border: "border-l-2 border-amber-600/60",  badge: "bg-amber-50  dark:bg-amber-900/20  text-amber-700  dark:text-amber-400",  icon: "I"   },
  2: { border: "border-l-2 border-slate-400/70",  badge: "bg-slate-100 dark:bg-slate-700/40  text-slate-500  dark:text-slate-300",  icon: "II"  },
  3: { border: "border-l-2 border-yellow-400",    badge: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400", icon: "III" },
  4: { border: "border-l-2 border-green-400",     badge: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",  icon: "IV"  },
} as const;

const PRESTIGE_STYLES: Record<string, { border: string; badge: string; icon: string }> = {
  legend:      { border: "border-l-2 border-amber-400",  badge: "bg-amber-50  dark:bg-amber-900/30  text-amber-600  dark:text-amber-400",  icon: "✦" },
  master:      { border: "border-l-2 border-violet-400", badge: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400", icon: "✦" },
  grandmaster: { border: "border-l-2 border-cyan-400",   badge: "bg-cyan-50   dark:bg-cyan-900/30   text-cyan-600   dark:text-cyan-400",   icon: "✦" },
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const levelRanges = [
  { min: 0, max: 0 },
  { min: 1, max: 2 },
  { min: 3, max: 4 },
  { min: 5, max: 6 },
  { min: 7, max: Infinity },
];

type FilterMode = number | "lastyear";
type DayCell = { date: string; count: number; inRange: boolean };

const toLocalKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function Profile() {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const fromChat = (location.state as { fromChat?: boolean; boardId?: number } | null);
  const viewingId = userIdParam ? Number(userIdParam) : null;
  const { user: currentUser } = useAuth();
  const isOwnProfile = viewingId == null || viewingId === currentUser?.id;

  const meQuery = useMe();
  const otherQuery = useEmployeeProfile(viewingId ?? 0);
  const updateEmployee = useUpdateEmployee();
  const meActivityQuery = useEmployeeActivities();

  const employee = isOwnProfile ? meQuery.data : otherQuery.data?.profile;
  const isLoading = isOwnProfile ? meQuery.isLoading : otherQuery.isLoading;
  const isError = isOwnProfile ? meQuery.isError : otherQuery.isError;
  const activityData = isOwnProfile ? meActivityQuery.data : otherQuery.data?.activities;

  const photoInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [achievementPage, setAchievementPage] = useState(0);
  const [achievementFilter, setAchievementFilter] = useState<"unlocked" | "all">("all");
  const swipeTouchX = useRef<number | null>(null);

  const today = new Date();
  const currentYear = today.getFullYear();
  const [filterMode, setFilterMode] = useState<FilterMode>(currentYear);

  // Scroll to current week (centered) for current/lastyear, or to end for past years
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isPastYear = typeof filterMode === "number" && filterMode < new Date().getFullYear();
    if (isPastYear) {
      el.scrollLeft = el.scrollWidth;
      return;
    }
    // Calculate today's week column index from gridStart
    const msPerDay = 86400000;
    const gs = new Date(filterMode === "lastyear"
      ? (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); d.setDate(d.getDate() + 1); return d; })()
      : new Date(typeof filterMode === "number" ? filterMode : new Date().getFullYear(), 0, 1)
    );
    gs.setDate(gs.getDate() - gs.getDay());
    const weekIndex = Math.floor((new Date().setHours(0,0,0,0) - gs.setHours(0,0,0,0)) / (7 * msPerDay));
    const cellSize = 14; // 11px cell + 3px gap
    const offset = weekIndex * cellSize - el.clientWidth / 2 + cellSize / 2;
    el.scrollLeft = Math.max(0, offset);
  }, [filterMode, activityData]);

  const countMap = new Map((activityData?.activities ?? []).map((a) => [a.date, a.count]));
  const totalActivity = activityData?.total_contributions ?? 0;
  const activeDays = activityData?.total_active_days ?? 0;
  const currentStreak = activityData?.current_streak ?? 0;
  const maxStreak = activityData?.max_streak ?? 0;

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  // Compute grid date range
  let gridRangeStart: Date;
  let gridRangeEnd: Date;
  if (filterMode === "lastyear") {
    gridRangeEnd = new Date(today);
    gridRangeStart = new Date(today);
    gridRangeStart.setFullYear(today.getFullYear() - 1);
    gridRangeStart.setDate(gridRangeStart.getDate() + 1);
  } else {
    gridRangeStart = new Date(filterMode, 0, 1);
    gridRangeEnd = new Date(filterMode, 11, 31);
  }

  const gridStart = new Date(gridRangeStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(gridRangeEnd);
  if (gridEnd.getDay() !== 6) gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const weeks: DayCell[][] = [];
  const monthLabels: { label: string; colIndex: number }[] = [];
  let col = 0;
  let cur = new Date(gridStart);
  let lastLabeledMonth = -1;
  while (cur <= gridEnd) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const key = toLocalKey(cur);
      const inRange = cur >= gridRangeStart && cur <= gridRangeEnd;
      const isFuture = cur > today;
      week.push({ date: key, count: inRange && !isFuture ? (countMap.get(key) ?? 0) : 0, inRange });
      cur.setDate(cur.getDate() + 1);
    }
    const firstInRange = week.find((c) => c.inRange);
    if (firstInRange) {
      const d = new Date(firstInRange.date);
      if (d.getDate() <= 7 && d.getMonth() !== lastLabeledMonth) {
        monthLabels.push({ label: d.toLocaleString("default", { month: "short" }), colIndex: col });
        lastLabeledMonth = d.getMonth();
      }
    }
    weeks.push(week);
    col++;
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      await updateEmployee.mutateAsync(formData);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const startEditing = () => {
    setFullName(employee?.full_name ?? "");
    setPhoneNumber(employee?.phone_number ?? "");
    setSaveError("");
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaveError("");
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("phone_number", phoneNumber);
    try {
      await updateEmployee.mutateAsync(formData);
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message ?? "Failed to save changes.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-[13px] text-zinc-500">Loading profile…</p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-[13px] text-red-500 dark:text-red-400">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {fromChat?.fromChat && (
          <div className="flex items-center justify-between mb-6 px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-[12px] text-zinc-500 dark:text-zinc-400">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Viewing from board chat</span>
            </div>
            <button
              onClick={() => navigate(`/board/${fromChat.boardId}`, { state: { openChat: true } })}
              className="flex items-center gap-1.5 text-[12px] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to chat
            </button>
          </div>
        )}

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-8">
          {isOwnProfile ? (
            <>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="relative w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden group cursor-pointer shrink-0"
                title="Change photo"
              >
                {employee.photo ? (
                  <img src={employee.photo} alt={employee.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[20px] text-zinc-700 dark:text-zinc-100">{employee.full_name.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </>
          ) : (
            <div className="relative w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              {employee.photo ? (
                <img src={employee.photo} alt={employee.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[20px] text-zinc-700 dark:text-zinc-100">{employee.full_name.charAt(0)}</span>
              )}
            </div>
          )}
          <div>
            <h1 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-1">{employee.full_name}</h1>
            <p className="text-[12px] text-zinc-500">{employee.email}</p>
          </div>
        </div>

        {/* Activity — full width */}
        <div className="mb-8 p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h2 className="text-[13px] text-zinc-700 dark:text-zinc-300">Activity</h2>
              </div>
              <div className="flex items-center gap-1">
                {([currentYear - 1, currentYear, "lastyear"] as const).map((mode) => (
                  <button
                    key={String(mode)}
                    onClick={() => setFilterMode(mode)}
                    className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                      filterMode === mode
                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {mode === "lastyear" ? "Last year" : mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500">
              <span>{activeDays} active days</span>
              <span>{totalActivity} contributions</span>
              <span title="Current streak">🔥 {currentStreak}d streak</span>
              <span title="Longest streak">⚡ {maxStreak}d best</span>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Day labels — fixed left */}
            <div className="flex flex-col gap-[3px] shrink-0 pt-[18px] pl-2">
              {dayLabels.map((day, i) => (
                <div key={day} className="h-[11px] flex items-center">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-600 w-6 leading-none">
                    {i % 2 === 1 ? day : ""}
                  </span>
                </div>
              ))}
            </div>

            {/* Scrollable grid */}
            <div className="relative flex-1 min-w-0">
              <div className="md:hidden absolute left-0 top-0 bottom-3 w-4 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none" />
              <div className="md:hidden absolute right-0 top-0 bottom-3 w-4 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none" />
              <div
                ref={scrollRef}
                className="overflow-x-auto pb-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgb(161 161 170) transparent" }}
              >
                <div className="inline-flex flex-col pl-2">
                  {/* Month labels */}
                  <div className="flex gap-[3px] mb-1 h-[14px]">
                    {weeks.map((_, wi) => (
                      <div key={wi} className="w-[11px] shrink-0 relative">
                        {monthLabels.find((m) => m.colIndex === wi) && (
                          <span className="absolute text-[9px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                            {monthLabels.find((m) => m.colIndex === wi)!.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Week columns */}
                  <div className="flex gap-[3px]">
                    {weeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((day, di) => (
                          <div
                            key={di}
                            className={`w-[11px] h-[11px] rounded-sm border transition-colors ${
                              day.inRange
                                ? `${getActivityColor(getLevel(day.count))} hover:ring-1 hover:ring-emerald-500/50 cursor-default`
                                : "bg-transparent border-transparent"
                            }`}
                            title={day.inRange ? `${day.date}: ${day.count} contributions` : ""}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-zinc-500">
            <span>Less</span>
            <div className="flex gap-1">
              {levelRanges.map((r, l) => (
                <div
                  key={l}
                  className={`w-[11px] h-[11px] rounded-sm border ${getActivityColor(l)} cursor-default`}
                  title={r.max === Infinity ? `${r.min}+` : r.min === r.max ? `${r.min}` : `${r.min}–${r.max}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Profile + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-8">

            {/* Profile Information */}
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <h2 className="text-[13px] text-zinc-700 dark:text-zinc-300">Profile Information</h2>
                </div>
                {isOwnProfile && !isEditing && (
                  <button onClick={startEditing} className="text-[12px] px-3 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Edit
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md text-emerald-600 dark:text-emerald-400 text-[12px]">
                  Profile updated successfully.
                </div>
              )}
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-[12px]">
                  {saveError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Full name</label>
                  <input
                    type="text"
                    value={isEditing ? fullName : employee.full_name}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Email</label>
                  <input type="email" value={employee.email} disabled className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 opacity-50" />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Phone</label>
                  <input
                    type="tel"
                    value={isEditing ? phoneNumber : employee.phone_number}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Birthday</label>
                  <input type="text" value={employee.birthday ?? "—"} disabled className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 opacity-50" />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Gender</label>
                  <input
                    type="text"
                    value={(() => {
                      const code = employee.gender?.code ?? employee.gender?.Code;
                      if (code === "male") return "Male";
                      if (code === "female") return "Female";
                      if (code === "other") return "Other";
                      return employee.gender?.name ?? employee.gender?.Name ?? "—";
                    })()}
                    disabled
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 opacity-50"
                  />
                </div>
                {isEditing && (
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={handleSave} disabled={updateEmployee.isPending} className="text-[12px] px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-60">
                      {updateEmployee.isPending ? "Saving…" : "Save changes"}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="text-[12px] px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password — own profile only */}
            {isOwnProfile && <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h2 className="text-[13px] text-zinc-700 dark:text-zinc-300">Change Password</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Current password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">New password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Confirm new password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100" placeholder="••••••••" />
                </div>
                <button disabled={!currentPassword || !newPassword || newPassword !== confirmPassword} className="text-[12px] px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Update password
                </button>
              </div>
            </div>}
          </div>

          {/* Sidebar */}
          <div className="order-1 lg:order-2 space-y-6">

            {/* Achievements */}
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-[12px] text-zinc-600 dark:text-zinc-400">Achievements</h3>
                <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-600">
                  {achievementList.filter((a) => a.currentLevel > 0).length}/{achievementList.length}
                </span>
              </div>

              {/* Filter toggle */}
              <div className="flex gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4">
                {(["unlocked", "all"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setAchievementFilter(f)}
                    className={`flex-1 text-[11px] py-1 rounded transition-colors capitalize ${
                      achievementFilter === f
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {f === "unlocked" ? `Unlocked (${achievementList.filter((a) => a.currentLevel > 0).length})` : "All"}
                  </button>
                ))}
              </div>

              {achievementFilter === "unlocked" ? (
                /* Unlocked — flat list, fixed height */
                <div
                  className="h-[380px] overflow-y-auto space-y-2 pr-0.5"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "rgb(161 161 170) transparent" }}
                >
                  {achievementList.filter((a) => a.currentLevel > 0).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
                      <Trophy className="w-6 h-6 opacity-40" />
                      <p className="text-[11px]">No achievements yet</p>
                    </div>
                  ) : (
                    achievementList
                      .filter((a) => a.currentLevel > 0)
                      .sort((a, b) => b.currentLevel - a.currentLevel)
                      .map((a) => {
                        const lvl = a.currentLevel;
                        const isPrestige = a.group === "prestige";
                        const style = isPrestige ? PRESTIGE_STYLES[a.id] : LEVEL_STYLES[lvl];
                        return (
                          <div
                            key={a.id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/60 ${style.border}`}
                          >
                            <span className="text-[18px] leading-none">{a.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-[12px] text-zinc-800 dark:text-zinc-200 leading-tight">{a.label}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight truncate">{a.levels[isPrestige ? 0 : lvl - 1]}</p>
                            </div>
                            <span className={`ml-auto shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${style.badge}`}>
                              {style.icon}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              ) : (
                /* All — carousel by group */
                <>
                  {/* Carousel header: arrow + group title + arrow */}
                  <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setAchievementPage((p) => (p - 1 + ACHIEVEMENT_GROUPS.length) % ACHIEVEMENT_GROUPS.length)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">
                  {ACHIEVEMENT_GROUPS[achievementPage].label}
                </span>
                <button
                  onClick={() => setAchievementPage((p) => (p + 1) % ACHIEVEMENT_GROUPS.length)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Fixed-height achievement list */}
              <div
                className="h-[380px] overflow-y-auto space-y-2 pr-0.5"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgb(161 161 170) transparent" }}
                onTouchStart={(e) => { swipeTouchX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (swipeTouchX.current === null) return;
                  const dx = e.changedTouches[0].clientX - swipeTouchX.current;
                  swipeTouchX.current = null;
                  if (Math.abs(dx) < 40) return;
                  setAchievementPage((p) =>
                    dx < 0
                      ? (p + 1) % ACHIEVEMENT_GROUPS.length
                      : (p - 1 + ACHIEVEMENT_GROUPS.length) % ACHIEVEMENT_GROUPS.length
                  );
                }}
              >
                {achievementList
                  .filter((a) => a.group === ACHIEVEMENT_GROUPS[achievementPage].key)
                  .sort((a, b) => b.currentLevel - a.currentLevel)
                  .map((a) => {
                    const lvl = a.currentLevel;
                    const unlocked = lvl > 0;
                    const isPrestige = a.group === "prestige";
                    const style = isPrestige
                      ? (unlocked ? PRESTIGE_STYLES[a.id] : { border: "", badge: "", icon: "" })
                      : LEVEL_STYLES[lvl];
                    const desc = lvl > 0 ? a.levels[lvl - 1] : a.levels[0];
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${style.border} ${
                          unlocked ? "bg-zinc-50 dark:bg-zinc-800/60" : "opacity-40"
                        }`}
                      >
                        <span className={`text-[18px] leading-none ${unlocked ? "" : "grayscale"}`}>{a.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-[12px] text-zinc-800 dark:text-zinc-200 leading-tight">{a.label}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight truncate">{desc}</p>
                        </div>
                        {unlocked && (
                          <span className={`ml-auto shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${style.badge}`}>
                            {style.icon}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {ACHIEVEMENT_GROUPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setAchievementPage(i)}
                    className={`rounded-full transition-all ${
                      i === achievementPage
                        ? "w-3 h-1.5 bg-zinc-500 dark:bg-zinc-400"
                        : "w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                    }`}
                  />
                ))}
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
