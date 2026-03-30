import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { Task } from "../data/mockData";

interface TaskListProps {
  tasks: Task[];
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

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <Link
          key={task.id}
          to={`/task/${task.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-zinc-900/50 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-zinc-100 truncate group-hover:text-white transition-colors">
              {task.title}
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 bg-zinc-900 text-zinc-400 border-zinc-800 shrink-0 w-16 justify-center">
            {task.assignedTo}
          </Badge>
          <span className="text-[11px] text-zinc-500 shrink-0 w-10 text-right">
            {task.estimatedTime}
          </span>
          <Badge
            variant="outline"
            className={`text-[11px] px-2 py-0 h-5 shrink-0 w-24 justify-center ${statusColors[task.status]}`}
          >
            {statusLabels[task.status]}
          </Badge>
        </Link>
      ))}
    </div>
  );
}