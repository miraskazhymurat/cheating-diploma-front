import { Link, useNavigate } from "react-router";
import { useState } from "react";
import Api from "../../api/Api.js";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    Api.login({ email, password })
      .then((response) => {
        if (response.data.token) {
          // Extract user data from response
          const userData = {
            id: response.data.id || response.userId || "",
            name: response.data.name || response.data.username || "",
            email: response.data.email || email,
          };
          login(response.data.token, userData);
          navigate("/boards");
        } else {
          setError("Login response invalid");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Login failed");
      });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-[15px] text-zinc-100 mb-1">Welcome back</h1>
          <p className="text-[12px] text-zinc-500">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded-md text-red-400 text-[12px]">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-[11px] text-zinc-400 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-zinc-900/50 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              placeholder="alex@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] text-zinc-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-zinc-900/50 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-[13px] bg-zinc-100 text-zinc-900 rounded-md hover:bg-white transition-colors"
          >
            Sign in
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[12px] text-zinc-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
