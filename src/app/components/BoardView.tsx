import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { Task, TaskStatus } from "../data/mockData";

interface BoardViewProps {
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

const columns: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "Todo" },
  { status: "in-progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

export function BoardView({ tasks }: BoardViewProps) {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        
        return (
          <div key={column.status} className="flex flex-col">
            {/* Column Header */}
            <div className="px-3 py-2 mb-3 flex items-center gap-2">
              <h3 className="text-[12px] text-zinc-400">{column.label}</h3>
              <span className="text-[11px] text-zinc-600">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Tasks */}
            <div className="space-y-2 flex-1">
              {columnTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/task/${task.id}`}
                  className="block px-3 py-3 rounded-md bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors group"
                >
                  <div className="text-[13px] text-zinc-100 mb-3 group-hover:text-white transition-colors">
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 bg-zinc-900 text-zinc-400 border-zinc-800">
                      {task.assignedTo}
                    </Badge>
                    <span className="text-[11px] text-zinc-500">
                      {task.estimatedTime}
                    </span>
                  </div>
                </Link>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <span className="text-[11px] text-zinc-600">No tasks</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
