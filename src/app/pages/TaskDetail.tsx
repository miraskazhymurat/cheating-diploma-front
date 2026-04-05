import { useParams } from "react-router";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/Modal";
import { useTaskModal } from "../context/TaskModalContext";
import { tasks } from "../data/mockData";

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

export function TaskDetail() {
  const { selectedTaskId, closeTask } = useTaskModal();
  const task = tasks.find((t) => t.id === selectedTaskId);

  if (!task) {
    return null;
  }

  return (
    <Modal isOpen={!!selectedTaskId} onClose={closeTask} title={task.title}>
      <div className="space-y-6">
        {/* Task Status and Metadata */}
        <div>
          <div className="flex items-start gap-3 mb-4">
            <Badge
              variant="outline"
              className={`text-[11px] px-2 py-0 h-5 ${statusColors[task.status]}`}
            >
              {statusLabels[task.status]}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500">Assigned to</span>
              <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 bg-zinc-900 text-zinc-400 border-zinc-800">
                {task.assignedTo}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500">Estimated</span>
              <span className="text-[11px] text-zinc-300">{task.estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Task Description */}
        {task.description && (
          <div className="px-4 py-4 rounded-md bg-zinc-900/30 border border-zinc-800/50">
            <h2 className="text-[12px] text-zinc-400 mb-3">Description</h2>
            <p className="text-[13px] text-zinc-300 leading-relaxed">
              {task.description}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
