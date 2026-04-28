import { TaskList } from "../components/TaskList";
import { BoardView } from "../components/BoardView";
import { TeamWorkload } from "../components/TeamWorkload";
import { AIInsights } from "../components/AIInsights";
import { Leaderboard } from "../components/Leaderboard";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { BoardChat } from "../components/BoardChat";
import { burnoutAlerts, promotionCandidates } from "../data/mockData";
import { LayoutList, LayoutGrid, Settings, ChevronDown, Plus, Sparkles, Users, SlidersHorizontal, X, Video } from "lucide-react";
import { useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { useBoard } from "../../hooks/useBoards";
import { useBoardTasks } from "../../hooks/useTasks";
import { useBoardEmployees } from "../../hooks/useEmployee";
import { useBoardStatuses } from "../../hooks/useStatuses";
import { useAuth } from "../context/AuthContext";
import { taskResponseToUI } from "../../api/types";
import { useEffect } from "react";

type FilterProperty = "status" | "priority" | "assignee";
interface ActiveFilter { property: FilterProperty; value: string; label: string }

const PROPERTY_LABELS: Record<FilterProperty, string> = {
  status: "Status",
  priority: "Priority",
  assignee: "Assignee",
};

export function Dashboard() {
  const { boardId: boardIdParam } = useParams();
  const boardId = Number(boardIdParam);
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [sidebarTab, setSidebarTab] = useState<"team" | "ai">("ai");
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pickerStep, setPickerStep] = useState<"closed" | "property" | "value">("closed");
  const [pendingProperty, setPendingProperty] = useState<FilterProperty | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pickerStep === "closed") return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerStep("closed");
        setPendingProperty(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerStep]);

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

  const filteredTasks = uiTasks.filter((task) =>
    activeFilters.every((f) => {
      if (f.property === "status") return String(task.statusId) === f.value;
      if (f.property === "priority") return task.priority === f.value;
      if (f.property === "assignee") return f.value === "me"
        ? task.assigneeId === Number(user?.id)
        : task.assigneeId === Number(f.value);
      return true;
    })
  );

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const getValueOptions = (property: FilterProperty) => {
    if (property === "status") return statuses.map((s) => ({ value: String(s.status_id), label: s.name }));
    if (property === "priority") return priorityOptions;
    if (property === "assignee") return [
      { value: "me", label: "Me" },
      ...employees.map((e) => ({ value: String(e.user_id), label: e.full_name })),
    ];
    return [];
  };

  const addFilter = (property: FilterProperty, value: string, label: string) => {
    setActiveFilters((prev) => {
      const without = prev.filter((f) => !(f.property === property && f.value === value));
      return [...without, { property, value, label }];
    });
    setPickerStep("closed");
    setPendingProperty(null);
  };

  const removeFilter = (property: FilterProperty, value: string) => {
    setActiveFilters((prev) => prev.filter((f) => !(f.property === property && f.value === value)));
  };

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
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <Link
                to="/boards"
                className="text-[15px] text-zinc-900 dark:text-zinc-100 hover:text-black dark:hover:text-white transition-colors truncate"
              >
                {board.name}
              </Link>
            </div>
            <p className="text-[12px] text-zinc-500">AI-powered task management</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="text-[12px] px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">New Task</span>
            </button>
            <Link
              to={`/board/${boardId}/meeting`}
              title="Meet"
              className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <Video className="w-4 h-4" />
            </Link>
            <Link
              to={`/board/${boardId}/settings`}
              title="Settings"
              className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 px-3 flex-wrap">
          {/* Active filter chips */}
          {activeFilters.map((f) => (
            <span
              key={`${f.property}-${f.value}`}
              className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              <span className="text-zinc-400 dark:text-zinc-500">{PROPERTY_LABELS[f.property]}</span>
              {f.label}
              <button onClick={() => removeFilter(f.property, f.value)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Add filter picker */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => { setPickerStep(pickerStep === "closed" ? "property" : "closed"); setPendingProperty(null); }}
              className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filter
            </button>

            {pickerStep === "property" && (
              <div className="absolute top-full left-0 mt-1 z-20 w-40 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
                {(Object.keys(PROPERTY_LABELS) as FilterProperty[]).map((prop) => (
                  <button
                    key={prop}
                    onClick={() => { setPendingProperty(prop); setPickerStep("value"); }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {PROPERTY_LABELS[prop]}
                  </button>
                ))}
              </div>
            )}

            {pickerStep === "value" && pendingProperty && (
              <div className="absolute top-full left-0 mt-1 z-20 w-44 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
                <button
                  onClick={() => { setPickerStep("property"); setPendingProperty(null); }}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800"
                >
                  ← {PROPERTY_LABELS[pendingProperty]}
                </button>
                {getValueOptions(pendingProperty).map((opt) => {
                  const active = activeFilters.some((f) => f.property === pendingProperty && f.value === opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => addFilter(pendingProperty, opt.value, opt.label)}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between ${active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}
                    >
                      {opt.label}
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Clear all
            </button>
          )}

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
          /* List mode: tasks on left, tabbed sidebar (AI / Team) on right */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main column */}
            <div className="lg:col-span-2">
              <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">
                Tasks
                {tasksLoading && <span className="ml-2 text-zinc-400 dark:text-zinc-600">Loading…</span>}
              </h2>
              <TaskList tasks={filteredTasks} statuses={statuses} boardId={boardId} />
            </div>

            {/* Tabbed sidebar */}
            <div className="block">
              {/* Tab bar */}
              <div className="flex items-center gap-1 mb-4 px-3">
                <button
                  onClick={() => setSidebarTab("ai")}
                  className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md transition-colors ${
                    sidebarTab === "ai"
                      ? "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  AI
                </button>
                <button
                  onClick={() => setSidebarTab("team")}
                  className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md transition-colors ${
                    sidebarTab === "team"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  Team
                </button>
              </div>

              {sidebarTab === "ai" ? (
                <AIInsights burnoutAlerts={burnoutAlerts} promotionCandidates={promotionCandidates} />
              ) : (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">Team Workload</h2>
                    <TeamWorkload employees={boardMembers} />
                  </div>
                  <div>
                    <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">Leaderboard</h2>
                    <Leaderboard employees={employees} currentUserId={user?.id} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Board mode: kanban on top on mobile, sidebar below; side-by-side on lg+ */
          <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
            {/* Board column */}
            <div className="w-full lg:flex-1 lg:min-w-0">
              <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">
                Tasks
                {tasksLoading && <span className="ml-2 text-zinc-400 dark:text-zinc-600">Loading…</span>}
              </h2>
              <BoardView boardId={boardId} tasks={filteredTasks} statuses={statuses} />
            </div>

            {/* Tabbed sidebar */}
            <div className="w-full lg:w-64 lg:shrink-0">
              <div className="flex items-center gap-1 mb-4 px-3">
                <button
                  onClick={() => setSidebarTab("ai")}
                  className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md transition-colors ${
                    sidebarTab === "ai"
                      ? "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  AI
                </button>
                <button
                  onClick={() => setSidebarTab("team")}
                  className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md transition-colors ${
                    sidebarTab === "team"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  Team
                </button>
              </div>

              {sidebarTab === "ai" ? (
                <AIInsights burnoutAlerts={burnoutAlerts} promotionCandidates={promotionCandidates} />
              ) : (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">Team Workload</h2>
                    <TeamWorkload employees={boardMembers} />
                  </div>
                  <div>
                    <h2 className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-4 px-3">Leaderboard</h2>
                    <Leaderboard employees={employees} currentUserId={user?.id} />
                  </div>
                </div>
              )}
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

      <BoardChat
        boardId={boardId}
        boardName={board.name}
        memberCount={employees.length}
      />
    </div>
  );
}
