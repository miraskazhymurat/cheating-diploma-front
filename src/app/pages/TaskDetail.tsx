import { useParams } from "react-router";
import { Badge } from "../components/ui/badge";
import { TaskModal } from "../components/TaskModal";
import { useTaskModal } from "../context/TaskModalContext";
import { tasks, TaskStatus } from "../data/mockData";

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
    <TaskModal
      task={task}
      isOpen={!!selectedTaskId}
      onClose={closeTask}
    />
  );
}
