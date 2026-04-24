import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Sun, Moon } from "lucide-react";
import { axiosInstance } from "../../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";

export function ResetPassword() {
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", { new_password: newPassword, token });
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const themeToggle = (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6">
        {themeToggle}
        <div className="text-center">
          <p className="text-[13px] text-red-500 dark:text-red-400 mb-4">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-6">
      {themeToggle}
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-1">Set new password</h1>
          <p className="text-[12px] text-zinc-500">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-[12px]">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="newPassword" className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-2">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-2">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full px-4 py-2 text-[13px] bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving…" : "Reset password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
