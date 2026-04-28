import { Link, useLocation, useNavigate } from "react-router";
import { LayoutGrid, LogOut, Inbox, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePendingInviteCount } from "../../hooks/useInvites";
import { useMe } from "../../hooks/useEmployee";
import { useTheme } from "../context/ThemeContext";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pendingCount = usePendingInviteCount();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const { data: employee } = useMe();

  const displayName = employee?.full_name ?? user?.name ?? "User";
  const initial = displayName.charAt(0).toUpperCase();
  const photoUrl = employee?.photo ?? null;

  return (
    <header className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-card/90 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/boards" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-100 dark:text-zinc-900" />
          </div>
          <span className="text-[13px] text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
            QuryltAI
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            to="/boards"
            className={`text-[12px] px-3 py-1.5 rounded-md transition-colors ${
              isActive("/boards") || isActive("/board")
                ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900/50"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Boards
          </Link>
          <Link
            to="/inbox"
            className={`text-[12px] px-3 py-1.5 rounded-md transition-colors relative ${
              isActive("/inbox")
                ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900/50"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inbox</span>
            </span>
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-[9px] rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1.5"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to="/profile"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
              isActive("/profile")
                ? "bg-zinc-100 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700"
                : "bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="w-7 h-7 rounded-full ring-2 ring-zinc-300 dark:ring-zinc-600 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-200">{initial}</span>
              )}
            </div>
            <span className="hidden sm:block text-[12px] text-zinc-700 dark:text-zinc-300">{displayName}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1.5"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
