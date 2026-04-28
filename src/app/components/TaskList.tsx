import { Badge } from "./ui/badge";
import { type UITask, type BoardStatusResponse } from "../../api/types";
import { useState } from "react";
import { TaskModal } from "./TaskModal";


const priorityConfig: Record<string, { label: string; className: string; dot: string }> = {
  low: { label: "Low", className: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50", dot: "bg-sky-500 dark:bg-sky-400" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50", dot: "bg-amber-500 dark:bg-amber-400" },
  high: { label: "High", className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50", dot: "bg-red-500 dark:bg-red-400" },
};

interface TaskListProps {
  tasks: UITask[];
  statuses?: BoardStatusResponse[];
  boardId?: number;
}

export function TaskList({ tasks, statuses, boardId }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<UITask | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-[13px] text-zinc-500">No tasks found</p>
      </div>
    );
  }

  function getStatusInfo(task: UITask): { label: string; color?: string } {
    if (statuses && statuses.length > 0) {
      const s = statuses.find((s) => s.status_id === task.statusId);
      if (s) return { label: s.name, color: s.colour };
    }
    return {
      label: task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1),
    };
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => {
          const { label, color } = getStatusInfo(task);
          return (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="w-full text-left px-4 py-3 rounded-md bg-white dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
                      {task.assignedTo}
                    </Badge>
                    {task.estimatedTime && (
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-600">{task.estimatedTime}</span>
                    )}
                    {task.priority && priorityConfig[task.priority] && (() => {
                      const d = priorityConfig[task.priority!];
                      return (
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 flex items-center gap-1 ${d.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
                          {d.label}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0 h-5 shrink-0 flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                >
                  {color && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />}
                  {label}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          boardId={boardId}
          statuses={statuses}
        />
      )}
    </>
  );
}
