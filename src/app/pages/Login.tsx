import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { authApi } from "../../api/auth";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    authApi.login(email, password)
      .then((response) => {
        if (response.token) {
          login(response.token, {
            id: response.user_id,
            name: response.full_name || "",
            email: response.email || email,
          });
          navigate("/boards");
        } else {
          setError("Login response invalid");
        }
      })
      .catch((err: Error) => {
        setError(err.message || "Login failed");
      });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-6">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-1">Welcome back</h1>
          <p className="text-[12px] text-zinc-500">Sign in to your account</p>
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

          <div>
            <label htmlFor="password" className="block text-[11px] text-zinc-600 dark:text-zinc-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-[13px] bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors"
          >
            Sign in
          </button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[12px] text-zinc-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
