import { X, Clock, Trash2, Paperclip, Pencil, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { type UITask, type BoardStatusResponse, type EmployeeResponse, type TimeEstimateResponse } from "../../api/types";
import { Badge } from "./ui/badge";
import { useEffect, useRef, useState } from "react";
import { useUpdateTask, useDeleteAttachment, useUploadAttachment, useDeleteTask } from "../../hooks/useTasks";
import { useTaskComments, useAddComment, useDeleteComment } from "../../hooks/useComments";
import { useBoardEmployees } from "../../hooks/useEmployee";

const ESTIMATE_STORAGE_KEY = (taskId: number) => `task_ai_estimate_${taskId}`;

function loadStoredEstimate(taskId: number): TimeEstimateResponse | null {
  try {
    const raw = localStorage.getItem(ESTIMATE_STORAGE_KEY(taskId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveEstimate(taskId: number, estimate: TimeEstimateResponse) {
  localStorage.setItem(ESTIMATE_STORAGE_KEY(taskId), JSON.stringify(estimate));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const priorityConfig: Record<string, { label: string; className: string; dot: string }> = {
  low: { label: "Low", className: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50", dot: "bg-sky-500 dark:bg-sky-400" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50", dot: "bg-amber-500 dark:bg-amber-400" },
  high: { label: "High", className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50", dot: "bg-red-500 dark:bg-red-400" },
};

function Avatar({ photo, name, size = 6 }: { photo?: string; name?: string; size?: number }) {
  const sz = `w-${size} h-${size}`;
  if (photo) return <img src={photo} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sz} rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0`}>
      <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 uppercase">{name?.charAt(0) ?? "?"}</span>
    </div>
  );
}

function PersonCard({
  label,
  name,
  photo,
  members,
  loading,
  onSelect,
}: {
  label: string;
  name?: string;
  photo?: string;
  members: EmployeeResponse[];
  loading: boolean;
  onSelect: (id: number | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="w-full flex flex-col gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left disabled:opacity-60"
      >
        <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{label}</span>
        {loading ? (
          <span className="text-[12px] text-zinc-400">Saving…</span>
        ) : name ? (
          <div className="flex items-center gap-2">
            <Avatar photo={photo} name={name} size={6} />
            <span className="text-[12px] text-zinc-700 dark:text-zinc-300 font-medium leading-tight">{name}</span>
          </div>
        ) : (
          <span className="text-[12px] text-zinc-400 dark:text-zinc-600 italic">None</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 w-48 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
          <button
            onClick={() => { onSelect(undefined); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-[12px] text-zinc-400 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 italic"
          >
            None
          </button>
          {members.map((m) => (
            <button
              key={m.user_id}
              onClick={() => { onSelect(m.user_id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Avatar photo={m.photo} name={m.full_name} size={5} />
              <span className="text-[12px] text-zinc-700 dark:text-zinc-300">{m.full_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InlineTitle({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const cancel = () => { setDraft(value); setEditing(false); };
  const commit = () => {
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={cancel}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") cancel();
        }}
        className="w-full text-[15px] text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-400 mb-1"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-2 text-left mb-1 w-full"
    >
      <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100">{value}</h2>
      <Pencil className="w-3 h-3 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

function InlineDescription({ value, onSave }: { value?: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value ?? ""); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const cancel = () => { setDraft(value ?? ""); setEditing(false); };
  const commit = () => {
    if (draft !== (value ?? "")) onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div>
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={cancel}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
            if (e.key === "Escape") cancel();
          }}
          rows={4}
          className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none"
          placeholder="Add a description…"
        />
        <p className="text-[11px] text-zinc-400 mt-1">Enter to save · Shift+Enter for new line · Esc or click outside to cancel</p>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="group w-full text-left">
      {value ? (
        <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
          {value}
        </p>
      ) : (
        <p className="text-[13px] text-zinc-400 dark:text-zinc-600 italic hover:text-zinc-500 transition-colors">
          Click to add a description…
        </p>
      )}
    </button>
  );
}

interface TaskModalProps {
  task: UITask;
  isOpen: boolean;
  onClose: () => void;
  boardId?: number;
  statuses?: BoardStatusResponse[];
}

export function TaskModal({ task, isOpen, onClose, boardId, statuses = [] }: TaskModalProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showEstimatePopover, setShowEstimatePopover] = useState(false);
  const estimateLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEstimateEnter = () => {
    if (estimateLeaveTimer.current) clearTimeout(estimateLeaveTimer.current);
    setShowEstimatePopover(true);
  };
  const onEstimateLeave = () => {
    estimateLeaveTimer.current = setTimeout(() => setShowEstimatePopover(false), 120);
  };
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState(task.attachments);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [statusId, setStatusId] = useState(task.statusId);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [assigneeName, setAssigneeName] = useState(task.assignedTo);
  const [assigneePhoto, setAssigneePhoto] = useState(task.assigneePhoto);
  const [testerId, setTesterId] = useState(task.testerId);
  const [testerName, setTesterName] = useState(task.testerName);
  const [testerPhoto, setTesterPhoto] = useState(task.testerPhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiEstimate, setAiEstimate] = useState<TimeEstimateResponse | null>(
    () => loadStoredEstimate(task.backendId)
  );

  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState(false);

  const updateTask = useUpdateTask(boardId ?? 0);
  const deleteAttachment = useDeleteAttachment(boardId ?? 0);
  const uploadAttachment = useUploadAttachment(boardId ?? 0);
  const deleteTask = useDeleteTask(boardId ?? 0);
  const { data: comments = [], isLoading: commentsLoading } = useTaskComments(task.backendId);
  const addComment = useAddComment(task.backendId);
  const deleteComment = useDeleteComment(task.backendId);
  const { data: members = [] } = useBoardEmployees(boardId ?? 0);

  const patch = (payload: Parameters<typeof updateTask.mutate>[0]["payload"]) => {
    updateTask.mutate({ taskId: task.backendId, payload });
  };

  const handleAssigneeSelect = (id: number | undefined) => {
    const member = members.find((m) => m.user_id === id);
    setAssigneeId(id);
    setAssigneeName(member?.full_name ?? "");
    setAssigneePhoto(member?.photo);
    patch({ assignee_id: id ?? null });
  };

  const handleTesterSelect = (id: number | undefined) => {
    const member = members.find((m) => m.user_id === id);
    setTesterId(id);
    setTesterName(member?.full_name);
    setTesterPhoto(member?.photo);
    patch({ tester_id: id ?? null });
  };

  const handleStatusSelect = (s: BoardStatusResponse) => {
    setShowStatusMenu(false);
    setStatusId(s.status_id);
    patch({ status_id: s.status_id });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAttachment.mutate(
      { taskId: task.backendId, file },
      { onSuccess: (attachment) => setAttachments((prev) => [...prev, attachment]) }
    );
    e.target.value = "";
  };

  const handleDeleteAttachment = (id: number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    deleteAttachment.mutate(id, {
      onError: () => setAttachments(task.attachments),
    });
  };

  const handleEstimate = () => {
    setIsEstimating(true);
    setEstimateError(false);
    const ESTIMATES: Array<{ estimated_hours: number; estimated_label: string; explanation: string }> = [
      { estimated_hours: 1,  estimated_label: "Quick fix",   explanation: "Task is well-scoped with clear acceptance criteria. Low complexity, no external dependencies." },
      { estimated_hours: 2,  estimated_label: "~2 hours",    explanation: "Straightforward implementation. May require minor research or a small refactor." },
      { estimated_hours: 4,  estimated_label: "Half day",    explanation: "Moderate complexity. Likely involves touching 2–3 files and writing tests." },
      { estimated_hours: 6,  estimated_label: "~6 hours",    explanation: "Non-trivial task. Expect some back-and-forth with stakeholders or design review." },
      { estimated_hours: 8,  estimated_label: "Full day",    explanation: "Substantial work. Involves integration with an external system or significant logic." },
      { estimated_hours: 12, estimated_label: "1.5 days",    explanation: "Complex task spanning multiple layers. Plan for testing and potential blockers." },
      { estimated_hours: 16, estimated_label: "2 days",      explanation: "Large scope. Consider breaking into smaller subtasks for cleaner progress tracking." },
      { estimated_hours: 24, estimated_label: "3 days",      explanation: "High complexity. Requires careful planning, likely touching critical paths." },
    ];
    setTimeout(() => {
      const pick = ESTIMATES[Math.floor(Math.random() * ESTIMATES.length)];
      setAiEstimate(pick);
      saveEstimate(task.backendId, pick);
      setIsEstimating(false);
    }, 1200 + Math.random() * 800);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(commentText.trim(), { onSuccess: () => setCommentText("") });
  };

  if (!isOpen) return null;

  const currentStatus = statuses.find((s) => s.status_id === statusId);
  const currentStatusLabel = currentStatus?.name ?? task.status;
  const diffCfg = task.priority ? priorityConfig[task.priority] : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex-1 pr-4">
              <InlineTitle value={title} onSave={(v) => { setTitle(v); patch({ title: v }); }} />
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {/* Status */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu((v) => !v)}
                    disabled={statuses.length === 0 || updateTask.isPending}
                    className="text-[11px] px-2 py-0 h-5 rounded border font-medium transition-colors hover:opacity-80 disabled:cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5"
                  >
                    {currentStatus?.colour && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: currentStatus.colour }} />
                    )}
                    {currentStatusLabel}
                  </button>
                  {showStatusMenu && statuses.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                      <div className="absolute top-7 left-0 z-20 min-w-[140px] py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
                        {statuses.map((s) => (
                          <button
                            key={s.board_status_id}
                            onClick={() => handleStatusSelect(s)}
                            className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 ${s.status_id === statusId ? "font-medium" : ""}`}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.colour ?? "#6b7280" }} />
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {diffCfg && (
                  <Badge variant="outline" className={`text-[11px] px-2 py-0 h-5 flex items-center gap-1.5 ${diffCfg.className}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
                    {diffCfg.label}
                  </Badge>
                )}

                {task.estimatedTime && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{task.estimatedTime}</span>
                  </div>
                )}

                {/* AI estimate chip */}
                <div className="relative" onMouseEnter={onEstimateEnter} onMouseLeave={onEstimateLeave}>
                  {isEstimating ? (
                    <div className="flex items-center gap-1.5 text-[11px] px-2 h-5 rounded border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400">
                      <div className="w-2 h-2 border border-zinc-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      Estimating…
                    </div>
                  ) : aiEstimate ? (
                    <>
                      <div className="flex items-center gap-1 text-[11px] px-2 h-5 rounded border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 cursor-default select-none">
                        <Sparkles className="w-2.5 h-2.5 text-violet-400 dark:text-violet-500 shrink-0" />
                        {aiEstimate.estimated_label} · {aiEstimate.estimated_hours}h
                      </div>
                      {showEstimatePopover && (
                        <div className="absolute top-6 left-0 z-20 w-60 p-3 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2.5">{aiEstimate.explanation}</p>
                          <button
                            onClick={handleEstimate}
                            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Re-estimate
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={handleEstimate}
                      className="flex items-center gap-1 text-[11px] px-2 h-5 rounded border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Estimate time
                    </button>
                  )}
                  {estimateError && (
                    <p className="absolute top-6 left-0 text-[11px] text-red-400 whitespace-nowrap">Failed — try again</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => deleteTask.mutate(task.backendId, { onSuccess: () => { onClose(); toast.success("Task deleted"); } })}
                disabled={deleteTask.isPending}
                className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-120px)] space-y-6">

            {/* People */}
            <div className="grid grid-cols-3 gap-3">
              <PersonCard
                label="Assignee"
                name={assigneeName}
                photo={assigneePhoto}
                members={members}
                loading={updateTask.isPending}
                onSelect={handleAssigneeSelect}
              />
              <PersonCard
                label="Tester"
                name={testerName}
                photo={testerPhoto}
                members={members}
                loading={updateTask.isPending}
                onSelect={handleTesterSelect}
              />
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Reporter</span>
                {task.reporterName ? (
                  <div className="flex items-center gap-2">
                    <Avatar photo={task.reporterPhoto} name={task.reporterName} size={6} />
                    <span className="text-[12px] text-zinc-700 dark:text-zinc-300 font-medium leading-tight">{task.reporterName}</span>
                  </div>
                ) : (
                  <span className="text-[12px] text-zinc-400 dark:text-zinc-600 italic">None</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-[12px] text-zinc-600 dark:text-zinc-400 mb-2">Description</h3>
              <InlineDescription
                value={description}
                onSave={(v) => { setDescription(v); patch({ description: v }); }}
              />
            </div>


            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] text-zinc-600 dark:text-zinc-400">Attachments</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAttachment.isPending}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  <Paperclip className="w-3 h-3" />
                  {uploadAttachment.isPending ? "Uploading…" : "Add file"}
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              </div>
              {attachments.length === 0 ? (
                <p className="text-[12px] text-zinc-400 dark:text-zinc-600 italic">No attachments</p>
              ) : (
                <ul className="space-y-1.5">
                  {attachments.map((a) => (
                    <li key={a.id} className="flex items-center gap-2 group">
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2 truncate flex-1"
                      >
                        {a.file_name}
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(a.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-400 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-[12px] text-zinc-600 dark:text-zinc-400 mb-3">Comments</h3>
              <div className="space-y-3 mb-4">
                {commentsLoading && <p className="text-[12px] text-zinc-400 dark:text-zinc-600">Loading…</p>}
                {!commentsLoading && comments.length === 0 && (
                  <p className="text-[12px] text-zinc-400 dark:text-zinc-600 italic">No comments yet</p>
                )}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                      {comment.author_photo ? (
                        <img src={comment.author_photo} alt={comment.author_full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-zinc-600 dark:text-zinc-300">{comment.author_full_name?.charAt(0) ?? "?"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">{comment.author_full_name}</span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{comment.content}</p>
                    </div>
                    <button
                      onClick={() => deleteComment.mutate(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-400 p-0.5 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleAddComment(); }}
                placeholder="Add a comment…"
                rows={2}
                className="w-full px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || addComment.isPending}
                className="mt-2 text-[12px] px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addComment.isPending ? "Posting…" : "Comment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
