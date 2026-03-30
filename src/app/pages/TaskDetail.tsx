import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../components/ui/badge";
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
  const { taskId } = useParams();
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[13px] text-zinc-500 mb-4">Task not found</p>
          <Link
            to="/"
            className="text-[12px] text-zinc-400 hover:text-zinc-100 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          to="/"
          className="text-[12px] text-zinc-400 hover:text-zinc-100 transition-colors inline-flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to dashboard
        </Link>

        {/* Task Header */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-[15px] text-zinc-100 flex-1">{task.title}</h1>
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
    </div>
  );
}
