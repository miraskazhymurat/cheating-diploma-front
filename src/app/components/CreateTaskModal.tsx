import { X, ChevronDown, Sparkles, User, Paperclip } from "lucide-react";
import { useState } from "react";
import { type TaskDifficulty } from "../data/mockData";
import { useBoardEmployees } from "../../hooks/useEmployee";
import { useCreateTask } from "../../hooks/useTasks";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
  boardName: string;
}

const priorityOptions = [
  { value: 1, label: "Low", color: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500 dark:bg-sky-400" },
  { value: 2, label: "Medium", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500 dark:bg-amber-400" },
  { value: 3, label: "High", color: "text-red-600 dark:text-red-400", dot: "bg-red-500 dark:bg-red-400" },
];

const difficultyOptions: {
  value: TaskDifficulty;
  id: number;
  label: string;
  color: string;
  dot: string;
}[] = [
  { value: "easy", id: 1, label: "Easy", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500 dark:bg-emerald-400" },
  { value: "medium", id: 2, label: "Medium", color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500 dark:bg-amber-400" },
  { value: "hard", id: 3, label: "Hard", color: "text-red-600 dark:text-red-400", dot: "bg-red-500 dark:bg-red-400" },
];

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
  const [useAI, setUseAI] = useState(false);
  const [difficulty, setDifficulty] = useState<TaskDifficulty | "">("");
  const [useAIDifficulty, setUseAIDifficulty] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showTesterDropdown, setShowTesterDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const closeAllDropdowns = () => {
    setShowAssigneeDropdown(false);
    setShowTesterDropdown(false);
    setShowDifficultyDropdown(false);
    setShowPriorityDropdown(false);
  };

  const toggleDropdown = (name: "assignee" | "tester" | "difficulty" | "priority") => {
    const current = { assignee: showAssigneeDropdown, tester: showTesterDropdown, difficulty: showDifficultyDropdown, priority: showPriorityDropdown }[name];
    closeAllDropdowns();
    if (!current) {
      if (name === "assignee") setShowAssigneeDropdown(true);
      else if (name === "tester") setShowTesterDropdown(true);
      else if (name === "difficulty") setShowDifficultyDropdown(true);
      else setShowPriorityDropdown(true);
    }
  };
  const [files, setFiles] = useState<File[]>([]);

  const { data: employees = [] } = useBoardEmployees(boardId);
  const createTask = useCreateTask(boardId);

  if (!isOpen) return null;

  const selectedAssignee = employees.find((e) => e.user_id === assigneeId);
  const selectedTester = employees.find((e) => e.user_id === testerId);
  const selectedDifficulty = difficultyOptions.find((d) => d.value === difficulty);
  const selectedPriority = priorityOptions.find((p) => p.value === priorityId);

  const handleCreate = async () => {
    if (!title.trim()) return;

    await createTask.mutateAsync({
      title,
      description: description || undefined,
      priority_id: priorityId ?? undefined,
      difficulty_id: selectedDifficulty?.id,
      assignee_id: useAI ? undefined : assigneeId ?? undefined,
      tester_id: useAITester ? undefined : testerId ?? undefined,
      files: files.length > 0 ? files : undefined,
    });

    onClose();
    setTitle("");
    setDescription("");
    setPriorityId(null);
    setAssigneeId(null);
    setTesterId(null);
    setUseAI(false);
    setUseAITester(false);
    setDifficulty("");
    setUseAIDifficulty(false);
    setFiles([]);
  };

  const handleAssigneeSelect = (id: number | "ai") => {
    if (id === "ai") {
      setUseAI(true);
      setAssigneeId(null);
    } else {
      setUseAI(false);
      setAssigneeId(id);
    }
    setShowAssigneeDropdown(false);
  };

  const handleTesterSelect = (id: number | "ai") => {
    if (id === "ai") {
      setUseAITester(true);
      setTesterId(null);
    } else {
      setUseAITester(false);
      setTesterId(id);
    }
    setShowTesterDropdown(false);
  };

  const handleDifficultySelect = (val: TaskDifficulty | "ai") => {
    if (val === "ai") {
      setUseAIDifficulty(true);
      setDifficulty("");
    } else {
      setUseAIDifficulty(false);
      setDifficulty(val);
    }
    setShowDifficultyDropdown(false);
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
                    onClick={() => toggleDropdown("assignee")}
                    className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <span className={useAI || assigneeId ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}>
                      {useAI ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          Find best assignee by AI
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
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </button>

                  {showAssigneeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl z-10 overflow-hidden">
                      <button
                        onClick={() => handleAssigneeSelect("ai")}
                        className={`w-full px-3 py-2.5 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-200 dark:border-zinc-800 ${
                          useAI ? "bg-blue-50 dark:bg-blue-950/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          <span className="text-zinc-900 dark:text-zinc-100">Find best assignee by AI</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 ml-5">
                          AI will automatically assign the best team member
                        </p>
                      </button>
                      <div className="max-h-48 overflow-y-auto">
                        {employees.map((emp) => (
                          <button
                            key={emp.user_id}
                            onClick={() => handleAssigneeSelect(emp.user_id)}
                            className={`w-full px-3 py-2 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                              assigneeId === emp.user_id && !useAI ? "bg-zinc-100 dark:bg-zinc-800" : ""
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
              </div>

              {/* Priority + Difficulty row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-2">Priority *</label>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown("priority")}
                      className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
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
                      className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-zinc-100 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <span className={useAIDifficulty || difficulty ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"}>
                        {useAIDifficulty ? (
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                            Let AI detect
                          </span>
                        ) : selectedDifficulty ? (
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
                        <button
                          onClick={() => handleDifficultySelect("ai")}
                          className={`w-full px-3 py-2.5 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-200 dark:border-zinc-800 ${
                            useAIDifficulty ? "bg-violet-50 dark:bg-violet-950/30" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                            <span className="text-zinc-900 dark:text-zinc-100">Let AI detect difficulty</span>
                          </div>
                        </button>
                        {difficultyOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleDifficultySelect(opt.value)}
                            className={`w-full px-3 py-2.5 text-[13px] text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 ${
                              difficulty === opt.value && !useAIDifficulty ? "bg-zinc-100 dark:bg-zinc-800" : ""
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
