import { Badge } from "./ui/badge";
import { useTaskModal } from "../context/TaskModalContext";
import { Task, TaskStatus } from "../data/mockData";
import { useState } from "react";
import { TaskModal } from "./TaskModal";

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
  const { openTask, updateTaskStatus } = useTaskModal();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (status: TaskStatus) => {
    setDragOverStatus(status);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear drag over if leaving the entire drop zone
    if (e.currentTarget === e.target) {
      setDragOverStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    e.preventDefault();
    
    if (draggedTaskId) {
      const draggedTask = tasks.find((t) => t.id === draggedTaskId);
      if (draggedTask && draggedTask.status !== targetStatus) {
        updateTaskStatus(draggedTaskId, targetStatus);
      }
    }
    
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          const isDropTarget = dragOverStatus === column.status && draggedTaskId;
          
          return (
            <div key={column.status} className="flex flex-col">
              {/* Column Header */}
              <div className="px-3 py-2 mb-3 flex items-center gap-2">
                <h3 className="text-[12px] text-zinc-400">{column.label}</h3>
                <span className="text-[11px] text-zinc-600">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Tasks - Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
                className={`space-y-2 flex-1 p-2 rounded-md transition-colors ${
                  isDropTarget
                    ? "bg-zinc-800/50 border-2 border-dashed border-zinc-600"
                    : "bg-transparent border-2 border-dashed border-transparent"
                }`}
              >
                {columnTasks.map((task) => (
                  <button
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTask(task)}
                    className={`w-full text-left px-3 py-3 rounded-md border transition-all cursor-grab active:cursor-grabbing ${
                      draggedTaskId === task.id
                        ? "opacity-50 bg-zinc-900/30 border-zinc-800/30"
                        : "bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700"
                    }`}
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
                  </button>
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
