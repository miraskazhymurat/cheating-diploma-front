import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { Task } from "../data/mockData";
import { useState } from "react";
import { TaskModal } from "./TaskModal";

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

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-[13px] text-zinc-500">No tasks found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="w-full text-left px-4 py-3 rounded-md bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] text-zinc-100 mb-2 group-hover:text-white transition-colors">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-zinc-900 text-zinc-400 border-zinc-800">
                    {task.assignedTo}
                  </Badge>
                  <span className="text-[11px] text-zinc-600">{task.estimatedTime}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0 h-5 shrink-0 ${statusColors[task.status]}`}
              >
                {statusLabels[task.status]}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}