import { TaskList } from "../components/TaskList";
import { BoardView } from "../components/BoardView";
import { TeamWorkload } from "../components/TeamWorkload";
import { AIInsights } from "../components/AIInsights";
import { Leaderboard } from "../components/Leaderboard";
import { TaskDetail } from "./TaskDetail";
import { TaskModalProvider } from "../context/TaskModalContext";
import { tasks, employees, insights, boards, getCurrentUser } from "../data/mockData";
import { LayoutList, LayoutGrid, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useParams, Link, Outlet } from "react-router";

export function Dashboard() {
  const { boardId } = useParams();
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [showOnlyYourTasks, setShowOnlyYourTasks] = useState(false);
  
  const currentUser = getCurrentUser();
  const board = boards.find((b) => b.id === boardId);

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[13px] text-zinc-500 mb-4">Board not found</p>
          <Link
            to="/boards"
            className="text-[12px] text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Back to boards
          </Link>
        </div>
      </div>
    );
  }
  
  // Filter tasks by board
  const boardTasks = tasks.filter((task) => task.boardId === boardId);
  
  // Filter by current user if needed
  const filteredTasks = showOnlyYourTasks
    ? boardTasks.filter((task) => task.assignedTo === currentUser.name)
    : boardTasks;

  // Filter employees to show only board members
  const boardMembers = employees.filter((e) => board.members.includes(e.id));

  return (
    <TaskModalProvider>
      <>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/boards"
                className="text-[15px] text-zinc-100 hover:text-white transition-colors"
              >
                {board.name}
              </Link>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-[12px] text-zinc-500">AI-powered task management</p>
          </div>
          <Link
            to={`/board/${boardId}/settings`}
            className="text-[12px] px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 transition-colors inline-flex items-center gap-2"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4 px-3">
          <button
            onClick={() => setShowOnlyYourTasks(!showOnlyYourTasks)}
            className={`text-[12px] px-3 py-1.5 rounded-md transition-colors ${
              showOnlyYourTasks
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            Your tasks
          </button>
          
          <div className="ml-auto flex items-center gap-1 bg-zinc-900/50 rounded-md p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="List view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "board"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Board view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-[13px] text-zinc-400 mb-4 px-3">Tasks</h2>
              {viewMode === "list" ? (
                <TaskList tasks={filteredTasks} />
              ) : (
                <BoardView tasks={filteredTasks} />
              )}
            </div>

            {/* AI Insights */}
            <div>
              <h2 className="text-[13px] text-zinc-400 mb-4 px-3">AI Insights</h2>
              <AIInsights insights={insights} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Team Workload */}
            <div>
              <h2 className="text-[13px] text-zinc-400 mb-4 px-3">Team Workload</h2>
              <TeamWorkload employees={boardMembers} />
            </div>

            {/* Leaderboard */}
            <div>
              <h2 className="text-[13px] text-zinc-400 mb-4 px-3">Leaderboard</h2>
              <Leaderboard employees={boardMembers} />
            </div>
          </div>
        </div>
    </div>
    <Outlet />
    <TaskDetail />
    </>
    </TaskModalProvider>
  );
}