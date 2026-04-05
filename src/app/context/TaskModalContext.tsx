import React, { createContext, useContext, useState } from "react";

interface TaskModalContextType {
  selectedTaskId: string | null;
  openTask: (taskId: string) => void;
  closeTask: () => void;
}

const TaskModalContext = createContext<TaskModalContextType | undefined>(undefined);

export function TaskModalProvider({ children }: { children: React.ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const openTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const closeTask = () => {
    setSelectedTaskId(null);
  };

  return (
    <TaskModalContext.Provider value={{ selectedTaskId, openTask, closeTask }}>
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
