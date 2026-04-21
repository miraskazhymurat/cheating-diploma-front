import { TaskList } from "../components/TaskList";
import { BoardView } from "../components/BoardView";
import { TeamWorkload } from "../components/TeamWorkload";
import { AIInsights } from "../components/AIInsights";
import { Leaderboard } from "../components/Leaderboard";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { insights } from "../data/mockData";
import { LayoutList, LayoutGrid, Settings, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { useParams, Link } from "react-router";
import { useBoard } from "../../hooks/useBoards";
import { useBoardTasks } from "../../hooks/useTasks";
import { useBoardEmployees } from "../../hooks/useEmployee";
import { useBoardStatuses } from "../../hooks/useStatuses";
import { useAuth } from "../context/AuthContext";
import { taskResponseToUI } from "../../api/types";

export function Dashboard() {
  const { boardId: boardIdParam } = useParams();
  const boardId = Number(boardIdParam);
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [showOnlyYourTasks, setShowOnlyYourTasks] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const { data: board, isLoading: boardLoading, isError: boardError } = useBoard(boardId);
  const { data: rawTasks = [], isLoading: tasksLoading } = useBoardTasks(boardId);
  const { data: employees = [] } = useBoardEmployees(boardId);
  const { data: statuses = [] } = useBoardStatuses(boardId);

  if (boardLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
        <p className="text-[13px] text-zinc-500">Loading board…</p>
      </div>
    );
  }

  if (boardError || !board) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 3.5rem)" }}>
          <div className="text-center">
            <p className="text-[13px] text-zinc-500 mb-4">Board not found</p>
            <Link to="/boards" className="text-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Back to boards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const uiTasks = rawTasks.map((t) => taskResponseToUI(t, employees));

  const filteredTasks = showOnlyYourTasks
    ? uiTasks.filter((t) => t.assigneeId === Number(user?.id))
    : uiTasks;

  const boardMembers = employees.map((e) => ({
    id: String(e.id),
    name: e.full_name,
    email: e.email,
    workload: "normal" as const,
    score: 0,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/boards"
                className="text-[15px] text-zinc-900 dark:text-zinc-100 hover:text-black dark:hover:text-white transition-colors"
              >
                {board.name}
              </Link>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-[12px] text-zinc-500">AI-powered task management</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="text-[12px] px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              New Task
            </button>
            <Link
              to={`/board/${boardId}/settings`}
              className="text-[12px] px-3 py-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors inline-flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4 px-3">
          <button
            onClick={() => setShowOnlyYourTasks(!showOnlyYourTasks)}
            className={`text-[12px] px-3 py-1.5 rounded-md transition-colors ${
              showOnlyYourTasks
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-transparent"
            }`}
          >
            Your tasks
          </button>

          <div className="ml-auto flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-md p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              title="List view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "board"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              title="Board view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          /* List mode: tasks + AI Insights on left, workload + leaderboard on right */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">
                  Tasks
                  {tasksLoading && <span className="ml-2 text-zinc-400 dark:text-zinc-600">Loading…</span>}
                </h2>
                <TaskList tasks={filteredTasks} statuses={statuses} boardId={boardId} />
              </div>
              <div>
                <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">AI Insights</h2>
                <AIInsights insights={insights} />
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">Team Workload</h2>
                <TeamWorkload employees={boardMembers} />
              </div>
              <div>
                <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">Leaderboard</h2>
                <Leaderboard employees={boardMembers} />
              </div>
            </div>
          </div>
        ) : (
          /* Board mode: tasks full width, workload + leaderboard below */
          <div className="space-y-8">
            <div>
              <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">
                Tasks
                {tasksLoading && <span className="ml-2 text-zinc-400 dark:text-zinc-600">Loading…</span>}
              </h2>
              <BoardView boardId={boardId} tasks={filteredTasks} statuses={statuses} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">Team Workload</h2>
                <TeamWorkload employees={boardMembers} />
              </div>
              <div>
                <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">Leaderboard</h2>
                <Leaderboard employees={boardMembers} />
              </div>
            </div>
            <div>
              <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">AI Insights</h2>
              <AIInsights insights={insights} />
            </div>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        boardId={boardId}
        boardName={board.name}
      />
    </div>
  );
}
