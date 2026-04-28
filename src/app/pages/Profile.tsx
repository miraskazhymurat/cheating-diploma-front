import { useEffect, useRef, useState } from "react";
import { Activity, Camera, Lock, Trophy, User } from "lucide-react";
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

const achievements = [
  { id: 1, emoji: "🌱", label: "First Steps", desc: "Made your first contribution", unlocked: true, color: "emerald" },
  { id: 2, emoji: "🔥", label: "On Fire", desc: "Reached a 7-day streak", unlocked: true, color: "orange" },
  { id: 3, emoji: "🎯", label: "Sharp Shooter", desc: "Completed 10 tasks", unlocked: true, color: "blue" },
  { id: 4, emoji: "⚡", label: "Speed Demon", desc: "Finished 5 tasks in one day", unlocked: false, color: "yellow" },
  { id: 5, emoji: "🤝", label: "Team Player", desc: "Assigned to 20 tasks", unlocked: false, color: "violet" },
  { id: 6, emoji: "💎", label: "Diamond", desc: "Reached 100 contributions", unlocked: false, color: "cyan" },
];

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
              onClick={() => navigate(`/board/${fromChat.boardId}`)}
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
          <div className="lg:col-span-2 space-y-8">

            {/* Profile Information */}
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <h2 className="text-[13px] text-zinc-700 dark:text-zinc-300">Profile Information</h2>
                </div>
                {!isEditing && !fromChat?.fromChat && (
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
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[12px] text-zinc-600 dark:text-zinc-400 mb-4">Account</h3>
              <div className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Gender</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {(() => {
                      const code = employee.gender?.code ?? employee.gender?.Code;
                      if (code === "male") return "Male";
                      if (code === "female") return "Female";
                      if (code === "other") return "Other";
                      return employee.gender?.name ?? employee.gender?.Name ?? "—";
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Active days</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{activeDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Contributions</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{totalActivity}</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h3 className="text-[12px] text-zinc-600 dark:text-zinc-400">Achievements</h3>
                <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-600">
                  {achievements.filter((a) => a.unlocked).length}/{achievements.length}
                </span>
              </div>
              <div className="space-y-2">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                      a.unlocked
                        ? "bg-zinc-50 dark:bg-zinc-800/60"
                        : "opacity-40"
                    }`}
                  >
                    <span className={`text-[18px] leading-none ${a.unlocked ? "" : "grayscale"}`}>
                      {a.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] text-zinc-800 dark:text-zinc-200 leading-tight">{a.label}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5 leading-tight truncate">{a.desc}</p>
                    </div>
                    {a.unlocked && (
                      <span className="ml-auto shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
                        done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
