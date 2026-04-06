import { Link } from "react-router";
import { Plus, Users, Mail } from "lucide-react";
import { CreateBoardModal } from "../components/CreateBoardModal";
import { CreateProfileModal } from "../components/CreateProfileModal";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Api from "../../api/Api";

interface Board {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isOwner: boolean;
  ownerId: string;
}

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  boards: Board[];
  messageCount: number;
  isFirstLogin: boolean;
}

export function Boards() {
  const { setUser } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Single request to get all data: user, boards, and message count
        const dashboardData: DashboardData = await Api.getDashboardData();
        
        if (dashboardData) {
          // Set user data in context and local state
          if (dashboardData.user) {
            setUser(dashboardData.user);
            setUserName(dashboardData.user.name);
          }

          // Set boards data
          if (Array.isArray(dashboardData.boards)) {
            setUserBoards(dashboardData.boards);
          }

          // Set message count
          if (typeof dashboardData.messageCount === 'number') {
            setMessageCount(dashboardData.messageCount);
          }

          if (dashboardData.isFirstLogin) {
            setIsFirstLogin(true);
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[13px] text-zinc-500">Loading your boards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[13px] text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[12px] px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-[15px] text-zinc-100 mb-1">
              {userName ? `Welcome, ${userName}` : "Your Boards"}
            </h1>
            <p className="text-[12px] text-zinc-500">Manage your task boards</p>
          </div>
          <div className="flex items-center gap-4">
            {messageCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/50 border border-zinc-800">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[12px] text-zinc-300">{messageCount} messages</span>
              </div>
            )}
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-[12px] px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-md hover:bg-white transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              New Board
            </button>
          </div>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userBoards.map((board) => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="block p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-colors group"
            >
              <div className="mb-4">
                <h3 className="text-[14px] text-zinc-100 mb-1 group-hover:text-white transition-colors">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-[12px] text-zinc-500 line-clamp-2">
                    {board.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{board.memberCount} {board.memberCount === 1 ? "member" : "members"}</span>
                </div>
                
                {board.isOwner && (
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                    Owner
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {userBoards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[13px] text-zinc-500 mb-4">No boards yet</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-[12px] px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
            >
              Create your first board
            </button>
          </div>
        )}
      </div>

      <CreateProfileModal
        isOpen={isFirstLogin}
        onComplete={() => setIsFirstLogin(false)}
      />
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}