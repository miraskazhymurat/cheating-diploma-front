import { useRef, useState } from "react";
import { Activity, Camera, Lock, User } from "lucide-react";
import { useMe, useUpdateEmployee } from "../../hooks/useEmployee";

const generateActivityData = () => {
  const data: number[][] = [];
  for (let w = 0; w < 12; w++) {
    data.push(Array.from({ length: 7 }, () => Math.floor(Math.random() * 5)));
  }
  return data;
};

const activityData = generateActivityData();

const getActivityColor = (level: number) => {
  if (level === 0) return "bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800";
  if (level === 1) return "bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-900/50";
  if (level === 2) return "bg-emerald-200 border-emerald-300 dark:bg-emerald-800/40 dark:border-emerald-800/50";
  if (level === 3) return "bg-emerald-300 border-emerald-400 dark:bg-emerald-700/50 dark:border-emerald-700/60";
  return "bg-emerald-400 border-emerald-500 dark:bg-emerald-600/60 dark:border-emerald-600/70";
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Profile() {
  const { data: employee, isLoading, isError } = useMe();
  const updateEmployee = useUpdateEmployee();

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const totalActivity = activityData.flat().reduce((s, v) => s + v, 0);
  const activeDays = activityData.flat().filter((v) => v > 0).length;

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
      setSaveError(err.response?.data?.message ?? "Failed to save changes.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
        <p className="text-[13px] text-zinc-500">Loading profile…</p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
        <p className="text-[13px] text-red-500 dark:text-red-400">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
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
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div>
              <h1 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-1">{employee.full_name}</h1>
              <p className="text-[12px] text-zinc-500">{employee.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Activity */}
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <h2 className="text-[13px] text-zinc-700 dark:text-zinc-300">Activity</h2>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                  <span>{activeDays} active days</span>
                  <span>{totalActivity} contributions</span>
                </div>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-1">
                  <div className="flex flex-col gap-1 pr-2">
                    <div className="h-[10px]" />
                    {dayLabels.map((day) => (
                      <div key={day} className="h-[10px] flex items-center">
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-600 w-6">{day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {activityData.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-1">
                        <div className="h-[10px] flex items-center justify-center">
                          {wi % 4 === 0 && (
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-600">W{wi + 1}</span>
                          )}
                        </div>
                        {week.map((level, di) => (
                          <div
                            key={di}
                            className={`w-[10px] h-[10px] rounded-sm border ${getActivityColor(level)} transition-colors hover:ring-1 hover:ring-emerald-500/50`}
                            title={`${level} contributions`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[11px] text-zinc-500">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((l) => (
                    <div key={l} className={`w-[10px] h-[10px] rounded-sm border ${getActivityColor(l)}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <h2 className="text-[13px] text-zinc-700 dark:text-zinc-300">Profile Information</h2>
                </div>
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="text-[12px] px-3 py-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
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
                  <input
                    type="email"
                    value={employee.email}
                    disabled
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 opacity-50"
                  />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Birthday</label>
                    <input
                      type="text"
                      value={employee.birthday ?? "—"}
                      disabled
                      className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 opacity-50"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={updateEmployee.isPending}
                      className="text-[12px] px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-60"
                    >
                      {updateEmployee.isPending ? "Saving…" : "Save changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-[12px] px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <h2 className="text-[13px] text-zinc-700 dark:text-zinc-300">Change Password</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Current password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="text-[12px] px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update password
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[12px] text-zinc-600 dark:text-zinc-400 mb-4">Account</h3>
              <div className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Gender</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{employee.gender?.name ?? "—"}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
