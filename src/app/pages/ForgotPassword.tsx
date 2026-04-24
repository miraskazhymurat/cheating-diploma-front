import { useState } from "react";
import { Link } from "react-router";
import { Mail, CheckCircle2, Sun, Moon } from "lucide-react";
import { axiosInstance } from "../../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";

export function ForgotPassword() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setSent(true);
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

  if (sent) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-6">
        {themeToggle}
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-2">Check your email</h1>
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We've sent a password reset link to
            </p>
            <p className="text-[13px] text-zinc-900 dark:text-zinc-100 mt-1">{email}</p>
          </div>

          <div className="mb-8 p-4 rounded-lg bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-start gap-3 text-left">
              <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-zinc-700 dark:text-zinc-300 mb-2">
                  Click the link in the email to reset your password. The link will expire in 24 hours.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Didn't receive the email? Check your spam folder.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full px-4 py-2 text-[13px] bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors"
            >
              Back to sign in
            </Link>
            <button
              onClick={() => setSent(false)}
              className="block w-full px-4 py-2 text-[12px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-100 transition-colors"
            >
              Try different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-6">
      {themeToggle}
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-1">Forgot password</h1>
          <p className="text-[12px] text-zinc-500">Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-[12px]">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              placeholder="alex@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-[13px] bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending…" : "Send reset link"}
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
