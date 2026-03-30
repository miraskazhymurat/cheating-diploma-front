import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import Api from "../../api/Api.js";

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Api.register({email: email, password: password})
      .then(() => {
        setShowVerification(true);
        setRegisteredEmail(email);
      })
      .catch((err) => {
        console.error("Registration failed:", err);
      });
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[15px] text-zinc-100 mb-2">Check your email</h1>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              We've sent a verification link to
            </p>
            <p className="text-[13px] text-zinc-100 mt-1">
              {registeredEmail}
            </p>
          </div>

          {/* Message */}
          <div className="mb-8 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-start gap-3 text-left">
              <Mail className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-zinc-300 mb-2">
                  Please verify your email before logging in. Click the link in the email to activate your account.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Didn't receive the email? Check your spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full px-4 py-2 text-[13px] bg-zinc-100 text-zinc-900 rounded-md hover:bg-white transition-colors"
            >
              Go to login
            </Link>
            <button
              onClick={() => setShowVerification(false)}
              className="block w-full px-4 py-2 text-[12px] text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Try different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-[15px] text-zinc-100 mb-1">Create account</h1>
          <p className="text-[12px] text-zinc-500">Start managing tasks with AI</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              minLength={8}
            />
            <p className="mt-1.5 text-[11px] text-zinc-600">Must be at least 8 characters</p>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-[13px] bg-zinc-100 text-zinc-900 rounded-md hover:bg-white transition-colors"
          >
            Create account
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[12px] text-zinc-500">
            Already have an account?{" "}
            <Link to="/login" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}