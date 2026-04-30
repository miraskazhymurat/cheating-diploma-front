import { Badge } from "./ui/badge";
import { type UITask, type BoardStatusResponse } from "../../api/types";
import { useRef, useState } from "react";
import { TaskModal } from "./TaskModal";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useUpdateTask } from "../../hooks/useTasks";

const priorityConfig: Record<string, { label: string; className: string; dot: string }> = {
  low: { label: "Low", className: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50", dot: "bg-sky-500 dark:bg-sky-400" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50", dot: "bg-amber-500 dark:bg-amber-400" },
  high: { label: "High", className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50", dot: "bg-red-500 dark:bg-red-400" },
};

const DRAG_TYPE = "TASK";

interface DragItem {
  taskId: number;
  fromStatusId: number;
}

interface TaskCardProps {
  task: UITask;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: { taskId: task.backendId, fromStatusId: task.statusId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(ref);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`px-4 py-3 rounded-md bg-white dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group ${isDragging ? "opacity-40" : ""}`}
    >
      <h4 className="text-[13px] text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
        {task.title}
      </h4>
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
  );
}

interface DroppableColumnProps {
  statusId: number;
  title: string;
  color?: string;
  tasks: UITask[];
  onDrop: (taskId: number, toStatusId: number) => void;
  onTaskClick: (task: UITask) => void;
}

function DroppableColumn({ statusId, title, color, tasks, onDrop, onTaskClick }: DroppableColumnProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: DRAG_TYPE,
    canDrop: (item) => item.fromStatusId !== statusId,
    drop: (item) => onDrop(item.taskId, statusId),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drop(ref);

  const isActive = isOver && canDrop;

  return (
    <div ref={ref} className="flex flex-col">
      <div className="flex items-center justify-between mb-3 px-3">
        <div className="flex items-center gap-2">
          {color && (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          )}
          <h3 className="text-[12px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{title}</h3>
        </div>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">{tasks.length}</span>
      </div>
      <div
        className={`space-y-2 flex-1 min-h-[80px] rounded-md p-1 transition-colors ${isActive ? "bg-zinc-100 dark:bg-zinc-800/40 ring-1 ring-zinc-300 dark:ring-zinc-700" : ""
          }`}
        style={
          color && isActive
            ? { boxShadow: `0 0 0 2px ${color}` }
            : undefined
        }
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-[12px] text-zinc-400 dark:text-zinc-600">
              {isActive ? "Drop here" : "No tasks"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface BoardViewProps {
  boardId: number;
  tasks: UITask[];
  statuses?: BoardStatusResponse[];
  currentUserId?: number;
}

export function BoardView({ boardId, tasks, statuses = [], currentUserId }: BoardViewProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const selectedTask = selectedTaskId != null ? tasks.find((t) => t.backendId === selectedTaskId) ?? null : null;
  const updateTask = useUpdateTask(boardId);

  const handleDrop = (taskId: number, toStatusId: number) => {
    updateTask.mutate({ taskId, payload: { status_id: toStatusId } });
  };

  const columns = statuses.length > 0
    ? statuses.map((s) => ({
      statusId: s.status_id,
      title: s.name,
      color: s.colour,
      tasks: tasks.filter((t) => t.statusId === s.status_id),
    }))
    : [
      { statusId: -1, title: "Todo", color: undefined, tasks: tasks.filter((t) => t.status === "todo") },
      { statusId: -2, title: "In Progress", color: undefined, tasks: tasks.filter((t) => t.status === "in-progress") },
      { statusId: -3, title: "Done", color: undefined, tasks: tasks.filter((t) => t.status === "done") },
    ];

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="md:overflow-x-auto pb-3">
          <div className="flex flex-col gap-4 md:flex-row">
            {columns.map((col) => (
              <div key={col.statusId} className="w-full md:w-64 md:shrink-0">
                <DroppableColumn
                  statusId={col.statusId}
                  title={col.title}
                  color={col.color}
                  tasks={col.tasks}
                  onDrop={handleDrop}
                  onTaskClick={(task) => setSelectedTaskId(task.backendId)}
                />
              </div>
            ))}
          </div>
        </div>
      </DndProvider>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTaskId(null)}
          boardId={boardId}
          statuses={statuses}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
