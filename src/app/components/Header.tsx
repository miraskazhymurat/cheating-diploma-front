import { Link, useLocation } from "react-router";
import { LayoutGrid, User, LogOut, Inbox } from "lucide-react";
import { getCurrentUser, getPendingInvites } from "../data/mockData";

export function Header() {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const pendingInvites = getPendingInvites(currentUser.id);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/boards" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-900" />
          </div>
          <span className="text-[13px] text-zinc-100 group-hover:text-white transition-colors">
            TaskAI
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            to="/boards"
            className={`text-[12px] px-3 py-1.5 rounded-md transition-colors ${
              isActive("/boards") || isActive("/board")
                ? "text-zinc-100 bg-zinc-900/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Boards
          </Link>
          <Link
            to="/inbox"
            className={`text-[12px] px-3 py-1.5 rounded-md transition-colors relative ${
              isActive("/inbox")
                ? "text-zinc-100 bg-zinc-900/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5" />
              Inbox
            </span>
            {pendingInvites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-[9px] rounded-full flex items-center justify-center">
                {pendingInvites.length}
              </span>
            )}
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/30 border border-zinc-800/50">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-[10px] text-zinc-300">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <span className="text-[12px] text-zinc-300">{currentUser.name}</span>
          </div>

          <Link
            to="/login"
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}