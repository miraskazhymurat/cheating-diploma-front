import { X, Clock, User } from "lucide-react";
import { Task, TaskStatus } from "../data/mockData";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { useTaskModal } from "../context/TaskModalContext";

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  todo: "bg-zinc-800 text-zinc-400 border-zinc-700",
  "in-progress": "bg-blue-950/30 text-blue-400 border-blue-900/50",
  done: "bg-emerald-950/30 text-emerald-400 border-emerald-900/50",
};

const statusLabels = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
};

const statusOptions: TaskStatus[] = ["todo", "in-progress", "done"];

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const { updateTaskStatus } = useTaskModal();
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task.status);

  if (!isOpen) return null;

  const handleStatusChange = (newStatus: TaskStatus) => {
    setLocalStatus(newStatus);
    updateTaskStatus(task.id, newStatus);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-800">
            <div className="flex-1 pr-4">
              <h2 className="text-[15px] text-zinc-100 mb-3">{task.title}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <select
                    value={localStatus}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className={`text-[11px] px-2 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-colors bg-zinc-900 cursor-pointer ${statusColors[localStatus]}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-3 w-px bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <User className="w-3 h-3" />
                  <span>{task.assignedTo}</span>
                </div>
                <div className="h-3 w-px bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimatedTime}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-[12px] text-zinc-400 mb-3">Description</h3>
              {task.description ? (
                <p className="text-[13px] text-zinc-300 leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-[13px] text-zinc-600 italic">
                  No description provided
                </p>
              )}
            </div>

            {/* Activity Section */}
            <div className="mb-6">
              <h3 className="text-[12px] text-zinc-400 mb-3">Activity</h3>
              <div className="space-y-3">
                <div className="flex gap-3 text-[12px]">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-zinc-400">AI</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-300 mb-1">
                      Task assigned to <span className="text-zinc-100">{task.assignedTo}</span>
                    </p>
                    <p className="text-[11px] text-zinc-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3 text-[12px]">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-zinc-400">AI</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-300 mb-1">
                      Estimated time set to <span className="text-zinc-100">{task.estimatedTime}</span>
                    </p>
                    <p className="text-[11px] text-zinc-600">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-[12px] text-zinc-400 mb-3">Comments</h3>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-zinc-300">A</span>
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 text-[13px] bg-zinc-900/50 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none"
                  />
                  <button
                    onClick={() => console.log("Add comment")}
                    className="mt-2 text-[12px] px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
