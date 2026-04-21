export type TaskStatus = "todo" | "in-progress" | "done";
export type WorkloadLevel = "low" | "normal" | "high";
export type TaskDifficulty = "easy" | "medium" | "hard";

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  estimatedTime: string;
  status: TaskStatus;
  description?: string;
  boardId: string;
  difficulty?: TaskDifficulty;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  workload: WorkloadLevel;
  score: number;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[]; // Employee IDs
  createdAt: string;
}

export interface BoardInvite {
  id: string;
  boardId: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Insight {
  id: string;
  text: string;
  type: "warning" | "suggestion";
}

export const boards: Board[] = [
  {
    id: "1",
    name: "Product Development",
    description: "Main product development board",
    ownerId: "1",
    members: ["1", "2", "3", "4", "5"],
    createdAt: "2026-03-15",
  },
  {
    id: "2",
    name: "Marketing Campaign",
    description: "Q2 marketing initiatives",
    ownerId: "1",
    members: ["1", "2", "4"],
    createdAt: "2026-03-20",
  },
  {
    id: "3",
    name: "Infrastructure",
    description: "DevOps and infrastructure tasks",
    ownerId: "3",
    members: ["1", "3", "5"],
    createdAt: "2026-03-25",
  },
];

export const boardInvites: BoardInvite[] = [
  {
    id: "1",
    boardId: "2",
    fromUserId: "2",
    toUserId: "1",
    status: "pending",
    createdAt: "2026-04-03",
  },
  {
    id: "2",
    boardId: "3",
    fromUserId: "3",
    toUserId: "1",
    status: "pending",
    createdAt: "2026-04-04",
  },
];

export const tasks: Task[] = [
  {
    id: "1",
    title: "Redesign user dashboard",
    assignedTo: "Alex",
    estimatedTime: "4h",
    status: "in-progress",
    description: "Update the user dashboard with new design system and components. Focus on improving usability and visual hierarchy.",
    boardId: "1",
    difficulty: "hard",
  },
  {
    id: "2",
    title: "Fix login authentication bug",
    assignedTo: "Alex",
    estimatedTime: "2h",
    status: "in-progress",
    description: "Users are experiencing issues with login. Need to debug and fix authentication flow.",
    boardId: "1",
    difficulty: "medium",
  },
  {
    id: "3",
    title: "Implement dark mode toggle",
    assignedTo: "Sam",
    estimatedTime: "3h",
    status: "todo",
    description: "Add dark mode support across the application with a toggle in settings.",
    boardId: "1",
    difficulty: "easy",
  },
  {
    id: "4",
    title: "Optimize database queries",
    assignedTo: "Jordan",
    estimatedTime: "5h",
    status: "in-progress",
    description: "Improve performance by optimizing slow database queries identified in production.",
    boardId: "1",
    difficulty: "hard",
  },
  {
    id: "5",
    title: "Write API documentation",
    assignedTo: "Sam",
    estimatedTime: "2h",
    status: "done",
    description: "Complete documentation for all API endpoints with examples and response codes.",
    boardId: "1",
    difficulty: "easy",
  },
  {
    id: "6",
    title: "Update dependencies",
    assignedTo: "Jordan",
    estimatedTime: "1h",
    status: "done",
    description: "Update all project dependencies to their latest stable versions.",
    boardId: "1",
    difficulty: "easy",
  },
  {
    id: "7",
    title: "Create onboarding flow",
    assignedTo: "Taylor",
    estimatedTime: "6h",
    status: "todo",
    description: "Design and implement a user onboarding flow for new users.",
    boardId: "1",
    difficulty: "hard",
  },
  {
    id: "8",
    title: "Add email notifications",
    assignedTo: "Sam",
    estimatedTime: "3h",
    status: "todo",
    description: "Implement email notification system for important user events.",
    boardId: "1",
    difficulty: "medium",
  },
  {
    id: "9",
    title: "Social media content calendar",
    assignedTo: "Sam",
    estimatedTime: "3h",
    status: "in-progress",
    description: "Plan and schedule Q2 social media posts.",
    boardId: "2",
    difficulty: "medium",
  },
  {
    id: "10",
    title: "Launch email campaign",
    assignedTo: "Taylor",
    estimatedTime: "5h",
    status: "todo",
    description: "Design and send product launch email to subscriber list.",
    boardId: "2",
    difficulty: "medium",
  },
  {
    id: "11",
    title: "Setup CI/CD pipeline",
    assignedTo: "Jordan",
    estimatedTime: "8h",
    status: "in-progress",
    description: "Configure automated deployment pipeline.",
    boardId: "3",
    difficulty: "hard",
  },
  {
    id: "12",
    title: "Server monitoring",
    assignedTo: "Morgan",
    estimatedTime: "4h",
    status: "todo",
    description: "Implement server health monitoring and alerts.",
    boardId: "3",
    difficulty: "medium",
  },
];

export const employees: Employee[] = [
  { id: "1", name: "Alex", email: "alex@example.com", workload: "high", score: 850 },
  { id: "2", name: "Sam", email: "sam@example.com", workload: "normal", score: 920 },
  { id: "3", name: "Jordan", email: "jordan@example.com", workload: "normal", score: 780 },
  { id: "4", name: "Taylor", email: "taylor@example.com", workload: "low", score: 650 },
  { id: "5", name: "Morgan", email: "morgan@example.com", workload: "low", score: 590 },
];

export const insights: Insight[] = [
  { id: "1", text: "Alex is overloaded", type: "warning" },
  { id: "2", text: "Sam can take more tasks", type: "suggestion" },
];

// Helper to get current user (simulated)
export const getCurrentUser = () => employees[0]; // Alex

// Helper to get pending invites for current user
export const getPendingInvites = (userId: string) => {
  return boardInvites.filter((invite) => invite.toUserId === userId && invite.status === "pending");
};