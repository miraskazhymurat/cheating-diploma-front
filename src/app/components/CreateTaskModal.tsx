import { X, ChevronDown, Sparkles, User, Paperclip } from "lucide-react";
import { useState, useEffect } from "react";
import { useBoardEmployees } from "../../hooks/useEmployee";
import { useCreateTask } from "../../hooks/useTasks";
import type { EmployeeResponse } from "../../api/types";
import { fetchBestAssignee, fetchBestTester } from "../../api/ai";
import type { CandidateScore } from "../../api/ai";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
  boardName: string;
}

const priorityOptions = [
  { value: 1, label: "Low", color: "text-zinc-400 dark:text-zinc-500", dot: "bg-zinc-300 dark:bg-zinc-600" },
  { value: 2, label: "Medium", color: "text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-500 dark:bg-zinc-400" },
  { value: 3, label: "High", color: "text-zinc-900 dark:text-zinc-100", dot: "bg-zinc-700 dark:bg-zinc-300" },
];

const difficultyOptions = [
  { value: 1, label: "Easy", color: "text-zinc-400 dark:text-zinc-500", dot: "bg-zinc-300 dark:bg-zinc-600" },
  { value: 2, label: "Medium", color: "text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-500 dark:bg-zinc-400" },
  { value: 3, label: "Hard", color: "text-zinc-900 dark:text-zinc-100", dot: "bg-zinc-700 dark:bg-zinc-300" },
];

// ── AI picker ────────────────────────────────────────────────────────────────

const SCAN_STEPS = [
  "Analyzing task requirements",
  "Checking team workload",
  "Comparing skill profiles",
  "Evaluating performance history",
  "Ranking candidates",
];

function AIAssigneePicker({
  boardId,
  taskTitle,
  taskDescription,
  priority,
  difficulty,
  employees,
  onSelect,
  onCancel,
  role,
}: {
  boardId: number;
  taskTitle: string;
  taskDescription: string;
  priority: string;
  difficulty: string;
  employees: EmployeeResponse[];
  onSelect: (emp: EmployeeResponse) => void;
  onCancel: () => void;
  role: "assignee" | "tester";
}) {
  const [completedSteps, setCompletedSteps] = useState(0);
  const [phase, setPhase] = useState<"scanning" | "done" | "error">("scanning");
  const [candidates, setCandidates] = useState<CandidateScore[]>([]);

  useEffect(() => {
    let step = 0;
    const stepInterval = setInterval(() => {
      step += 1;
      setCompletedSteps(step);
      if (step >= SCAN_STEPS.length) clearInterval(stepInterval);
    }, 600);

    const apiFn = role === "tester" ? fetchBestTester : fetchBestAssignee;
    apiFn({
      board_id: boardId,
      task_title: taskTitle || "New task",
      task_description: taskDescription,
      priority,
      difficulty,
    })
      .then((res) => {
        clearInterval(stepInterval);
        setCompletedSteps(SCAN_STEPS.length);
        setCandidates(res.candidates);
        setTimeout(() => setPhase("done"), 300);
      })
      .catch(() => {
        clearInterval(stepInterval);
        setPhase("error");
      });

    return () => clearInterval(stepInterval);
  }, []);

  const empByUserId = Object.fromEntries(employees.map((e) => [e.user_id, e]));

  const confidenceCfg = (score: number) =>
    score >= 0.75
      ? { label: "HIGH",   cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50" }
      : score >= 0.55
      ? { label: "MEDIUM", cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50" }
      : { label: "LOW",    cls: "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" };

  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="mt-2 rounded-lg border border-violet-200 dark:border-violet-900/50 bg-violet-50/40 dark:bg-violet-950/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-200 dark:border-violet-900/50">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-3.5 h-3.5 text-violet-500 ${phase === "scanning" ? "animate-pulse" : ""}`} />
          <span className="text-[12px] font-medium text-violet-700 dark:text-violet-300">
            {phase === "scanning" ? "AI is analyzing your team…" : phase === "error" ? "Analysis failed" : "Analysis complete"}
          </span>
        </div>
        <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {phase === "scanning" && (
        <div className="px-4 py-4 space-y-2.5">
          {SCAN_STEPS.map((step, i) => {
            const done   = i < completedSteps;
            const active = i === completedSteps;
            return (
              <div key={i} className={`flex items-center gap-2.5 transition-opacity duration-300 ${i > completedSteps ? "opacity-25" : "opacity-100"}`}>
                {done ? (
                  <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : active ? (
                  <div className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                )}
                <span className={`text-[12px] ${done ? "text-zinc-700 dark:text-zinc-300" : active ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-zinc-600"}`}>
                  {step}{active && <span className="animate-pulse">…</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {phase === "error" && (
        <div className="px-4 py-4 text-[12px] text-zinc-500 dark:text-zinc-400">
          Could not reach AI service. Please try again.
        </div>
      )}

      {phase === "done" && (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-80 overflow-y-auto">
          {candidates.map((c) => {
            const emp = empByUserId[c.user_id];
            const conf = confidenceCfg(c.composite_score);
            const subScores = [
              { label: "Skill Match",  value: c.skill_match,        weight: "35%" },
              { label: "Workload",     value: c.workload_score,     weight: "30%" },
              { label: "Performance",  value: c.performance_score,  weight: "20%" },
              { label: "Availability", value: c.availability_score, weight: "10%" },
              { label: "Growth",       value: c.growth_score,       weight: "5%"  },
            ];
            return (
              <div key={c.user_id} className={`px-4 py-3 ${c.rank === 1 ? "bg-violet-50/70 dark:bg-violet-950/30" : ""}`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {c.rank === 1 && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/50 border border-violet-200 dark:border-violet-800/50 px-1.5 py-0.5 rounded shrink-0">
                        Best match
                      </span>
                    )}
                    {(c.photo || emp?.photo) ? (
                      <img src={c.photo || emp?.photo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-medium text-zinc-600 dark:text-zinc-300 shrink-0">
                        {c.full_name.charAt(0)}
                      </div>
                    )}
                    <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{c.full_name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${conf.cls}`}>{conf.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">{pct(c.composite_score)}</span>
                    <button
                      onClick={() => emp && onSelect(emp)}
                      disabled={!emp}
                      className={`text-[11px] px-2.5 py-1 rounded transition-colors font-medium ${
                        c.rank === 1
                          ? "bg-violet-600 text-white hover:bg-violet-700"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      Select
                    </button>
                  </div>
                </div>

                {c.reasoning && (
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2 italic">{c.reasoning}</p>
                )}

                <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                  {subScores.map((sub) => (
                    <div key={sub.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
                          {sub.label}<span className="text-zinc-400 dark:text-zinc-600 ml-1">·{sub.weight}</span>
                        </span>
                        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 tabular-nums">{pct(sub.value)}</span>
                      </div>
                      <div className="h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-400 dark:bg-violet-500 rounded-full"
                          style={{ width: pct(sub.value), transition: "width 0.8s ease" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── main modal ───────────────────────────────────────────────────────────────

export function CreateTaskModal({
  isOpen,
  onClose,
  boardId,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priorityId, setPriorityId] = useState<number | null>(null);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [testerId, setTesterId] = useState<number | null>(null);
  const [useAITester, setUseAITester] = useState(false);
  const [showAIPicker, setShowAIPicker] = useState(false);
  const [showAITesterPicker, setShowAITesterPicker] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showTesterDropdown, setShowTesterDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const closeAllDropdowns = () => {
    setShowAssigneeDropdown(false);
    setShowTesterDropdown(false);
    setShowPriorityDropdown(false);
    setShowDifficultyDropdown(false);
  };

  const toggleDropdown = (name: "assignee" | "tester" | "priority" | "difficulty") => {
    const current = { assignee: showAssigneeDropdown, tester: showTesterDropdown, priority: showPriorityDropdown, difficulty: showDifficultyDropdown }[name];
    closeAllDropdowns();
    if (!current) {
      if (name === "assignee") setShowAssigneeDropdown(true);
      else if (name === "tester") setShowTesterDropdown(true);
      else if (name === "priority") setShowPriorityDropdown(true);
      else setShowDifficultyDropdown(true);
    }
  };

  const { data: employees = [] } = useBoardEmployees(boardId);
  const createTask = useCreateTask(boardId);

  if (!isOpen) return null;

  const selectedAssignee = employees.find((e) => e.user_id === assigneeId);
  const selectedTester = employees.find((e) => e.user_id === testerId);
  const selectedPriority = priorityOptions.find((p) => p.value === priorityId);
  const selectedDifficulty = difficultyOptions.find((d) => d.value === difficultyId);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title,
      description: description || undefined,
      priority_id: priorityId ?? undefined,
      difficulty_id: difficultyId ?? undefined,
      assignee_id: assigneeId ?? undefined,
      tester_id: useAITester ? undefined : testerId ?? undefined,
      files: files.length > 0 ? files : undefined,
    });
    onClose();
    setTitle("");
    setDescription("");
    setPriorityId(null);
    setDifficultyId(null);
    setAssigneeId(null);
    setTesterId(null);
    setUseAITester(false);
    setShowAIPicker(false);
    setShowAITesterPicker(false);
    setFiles([]);
  };

  const handleAISelect = (emp: EmployeeResponse) => {
    setAssigneeId(emp.user_id);
    setShowAIPicker(false);
  };

  const handleAssigneeSelect = (id: number | "ai") => {
    if (id === "ai") {
      setAssigneeId(null);
      setShowAssigneeDropdown(false);
      setShowAIPicker(true);
    } else {
      setShowAIPicker(false);
      setAssigneeId(id);
      setShowAssigneeDropdown(false);
    }
  };

  const handleTesterSelect = (id: number | "ai") => {
    if (id === "ai") {
      setUseAITester(true);
      setTesterId(null);
      setShowTesterDropdown(false);
      setShowAITesterPicker(true);
    } else {
      setUseAITester(false);
      setShowAITesterPicker(false);
      setTesterId(id);
      setShowTesterDropdown(false);
    }
  };

  const handleAITesterSelect = (emp: EmployeeResponse) => {
    setTesterId(emp.user_id);
    setUseAITester(false);
    setShowAITesterPicker(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100">Create new task</h2>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-140px)]">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">
                  Task title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Redesign user dashboard"
                  className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What needs to be done?"
                  rows={4}
                  className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none"
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Assignee *</label>
                <div className="relative">
                  <button
                    onClick={() => { if (!showAIPicker) toggleDropdown("assignee"); }}
                    className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <span className={assigneeId || showAIPicker ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}>
                      {showAIPicker ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
                          <span className="text-violet-600 dark:text-violet-400">Finding best assignee…</span>
                        </span>
                      ) : selectedAssignee ? (
                        <span className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          {selectedAssignee.full_name}
                        </span>
                      ) : (
                        "Select assignee"
                      )}
                    </span>
                    {!showAIPicker && <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>

                  {showAssigneeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl z-10 overflow-hidden">
                      <button
                        onClick={() => handleAssigneeSelect("ai")}
                        className="w-full px-3 py-2.5 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                          <span className="text-zinc-900 dark:text-zinc-100">Find best assignee by AI</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 ml-5">
                          AI ranks candidates by skill, workload &amp; performance
                        </p>
                      </button>
                      <div className="max-h-48 overflow-y-auto">
                        {employees.map((emp) => (
                          <button
                            key={emp.user_id}
                            onClick={() => handleAssigneeSelect(emp.user_id)}
                            className={`w-full px-3 py-2 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                              assigneeId === emp.user_id ? "bg-zinc-100 dark:bg-zinc-800" : ""
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                              <span className="text-[10px] text-zinc-600 dark:text-zinc-300">
                                {emp.full_name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="text-zinc-900 dark:text-zinc-100">{emp.full_name}</div>
                              <div className="text-[11px] text-zinc-500">{emp.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI picker panel */}
                {showAIPicker && (
                  <AIAssigneePicker
                    boardId={boardId}
                    taskTitle={title}
                    taskDescription={description}
                    priority={priorityOptions.find((p) => p.value === priorityId)?.label.toLowerCase() ?? "medium"}
                    difficulty={difficultyOptions.find((d) => d.value === difficultyId)?.label.toLowerCase() ?? "medium"}
                    employees={employees}
                    onSelect={handleAISelect}
                    onCancel={() => setShowAIPicker(false)}
                    role="assignee"
                  />
                )}
              </div>

              {/* Tester */}
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Tester *</label>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("tester")}
                    className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <span className={useAITester || testerId ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}>
                      {useAITester ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          Find best tester by AI
                        </span>
                      ) : selectedTester ? (
                        <span className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          {selectedTester.full_name}
                        </span>
                      ) : (
                        "Select tester"
                      )}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </button>

                  {showTesterDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl z-10 overflow-hidden">
                      <button
                        onClick={() => handleTesterSelect("ai")}
                        className={`w-full px-3 py-2.5 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-200 dark:border-zinc-800 ${
                          useAITester ? "bg-blue-50 dark:bg-blue-950/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          <span className="text-zinc-900 dark:text-zinc-100">Find best tester by AI</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 ml-5">
                          AI will automatically assign the best tester
                        </p>
                      </button>
                      <div className="max-h-48 overflow-y-auto">
                        {employees.map((emp) => (
                          <button
                            key={emp.user_id}
                            onClick={() => handleTesterSelect(emp.user_id)}
                            className={`w-full px-3 py-2 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                              testerId === emp.user_id && !useAITester ? "bg-zinc-100 dark:bg-zinc-800" : ""
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                              <span className="text-[10px] text-zinc-600 dark:text-zinc-300">
                                {emp.full_name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="text-zinc-900 dark:text-zinc-100">{emp.full_name}</div>
                              <div className="text-[11px] text-zinc-500">{emp.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {showAITesterPicker && (
                  <AIAssigneePicker
                    boardId={boardId}
                    taskTitle={title}
                    taskDescription={description}
                    priority={priorityOptions.find((p) => p.value === priorityId)?.label.toLowerCase() ?? "medium"}
                    difficulty={difficultyOptions.find((d) => d.value === difficultyId)?.label.toLowerCase() ?? "medium"}
                    employees={employees}
                    onSelect={handleAITesterSelect}
                    onCancel={() => { setShowAITesterPicker(false); setUseAITester(false); }}
                    role="tester"
                  />
                )}
              </div>

              {/* Priority + Difficulty row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Priority *</label>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown("priority")}
                      className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <span className={selectedPriority ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}>
                        {selectedPriority ? (
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedPriority.dot}`} />
                            <span className={selectedPriority.color}>{selectedPriority.label}</span>
                          </span>
                        ) : (
                          "Select"
                        )}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </button>

                    {showPriorityDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl z-10 overflow-hidden">
                        {priorityOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setPriorityId(opt.value); setShowPriorityDropdown(false); }}
                            className={`w-full px-3 py-2.5 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                              priorityId === opt.value ? "bg-zinc-100 dark:bg-zinc-800" : ""
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                            <span className={opt.color}>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Difficulty</label>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown("difficulty")}
                      className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <span className={selectedDifficulty ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}>
                        {selectedDifficulty ? (
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedDifficulty.dot}`} />
                            <span className={selectedDifficulty.color}>{selectedDifficulty.label}</span>
                          </span>
                        ) : (
                          "Select"
                        )}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </button>

                    {showDifficultyDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl z-10 overflow-hidden">
                        {difficultyOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setDifficultyId(opt.value); setShowDifficultyDropdown(false); }}
                            className={`w-full px-3 py-2.5 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                              difficultyId === opt.value ? "bg-zinc-100 dark:bg-zinc-800" : ""
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                            <span className={opt.color}>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Attachments</label>
                <label className="flex items-center gap-2 px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400">
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span>{files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Choose files…"}</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  />
                </label>
                {files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between text-[12px] text-zinc-600 dark:text-zinc-400 px-1">
                        <span className="truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="ml-2 text-zinc-400 hover:text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={onClose}
              className="text-[12px] px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || createTask.isPending}
              className="text-[12px] px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTask.isPending ? "Creating…" : "Create task"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
