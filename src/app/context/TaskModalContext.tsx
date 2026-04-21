import React, { createContext, useContext, useState } from "react";
import { TaskStatus, tasks } from "../data/mockData";

interface TaskModalContextType {
  selectedTaskId: string | null;
  openTask: (taskId: string) => void;
  closeTask: () => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

const TaskModalContext = createContext<TaskModalContextType | undefined>(undefined);

export function TaskModalProvider({ children }: { children: React.ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [, setTasksState] = useState(tasks);

  const openTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const closeTask = () => {
    setSelectedTaskId(null);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      setTasksState([...tasks]);
    }
  };

  return (
    <TaskModalContext.Provider value={{ selectedTaskId, openTask, closeTask, updateTaskStatus }}>
      {children}
    </TaskModalContext.Provider>
  );
}

export function useTaskModal() {
  const context = useContext(TaskModalContext);
  if (!context) {
    throw new Error("useTaskModal must be used within TaskModalProvider");
  }
  return context;
}
