import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Bell, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inboxCount] = useState(3); // Mock notification count
  const [userName] = useState("User"); // Will be fetched from API in main page

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/boards"
            className="flex items-center gap-2 text-[15px] font-semibold text-zinc-100 hover:text-white transition-colors"
          >
            <div className="w-7 h-7 bg-zinc-800 rounded-md flex items-center justify-center border border-zinc-700">
              <span className="text-white font-bold text-[11px]">TM</span>
            </div>
            <span className="hidden sm:inline">TaskFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/boards"
              className="text-[13px] text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Boards
            </Link>
            <a
              href="#"
              className="text-[13px] text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Teams
            </a>
            <a
              href="#"
              className="text-[13px] text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Settings
            </a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Inbox */}
            <button className="relative p-2 text-zinc-400 hover:text-zinc-300 transition-colors rounded-md hover:bg-zinc-900/50">
              <Bell className="w-4 h-4" />
              {inboxCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-zinc-300 rounded-md hover:bg-zinc-900/50 transition-colors"
              >
                <div className="w-5 h-5 bg-zinc-800 rounded-md flex items-center justify-center border border-zinc-700">
                  <span className="text-white text-[9px] font-semibold">
                    {userName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate text-[12px]">
                  {userName || "User"}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg overflow-hidden z-10">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-[11px] text-zinc-500">Signed in as</p>
                    <p className="text-[12px] text-zinc-300 font-medium truncate">
                      user@example.com
                    </p>
                  </div>

                  <button className="w-full text-left px-3 py-2 text-[12px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Profile
                  </button>

                  <button className="w-full text-left px-3 py-2 text-[12px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors">
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-[12px] text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-colors flex items-center gap-2 border-t border-zinc-800 mt-1 pt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-300 transition-colors rounded-md hover:bg-zinc-900/50"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-zinc-800 py-2 space-y-1 mb-2">
            <Link
              to="/boards"
              className="block px-3 py-2 text-[12px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 rounded-md transition-colors"
            >
              Boards
            </Link>
            <a
              href="#"
              className="block px-3 py-2 text-[12px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 rounded-md transition-colors"
            >
              Teams
            </a>
            <a
              href="#"
              className="block px-3 py-2 text-[12px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 rounded-md transition-colors"
            >
              Settings
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
