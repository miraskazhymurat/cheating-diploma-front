// ─── Backend response types ────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  user_id: number;
  full_name: string | null;
  email: string;
}

export interface EmployeeResponse {
  id: number;
  user_id: number;
  board_member_id: number;
  full_name: string;
  photo: string;
  email: string;
  phone_number: string;
  birthday: string;
  team: { id: number; name: string; code: string };
  gender: { id?: number; ID?: number; name?: string; Name?: string; code?: string; Code?: string };
}

export interface BoardResponse {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  isOwner: boolean;
  ownerId: number;
}

export interface DashboardResponse {
  boards: BoardResponse[];
  isFirstLogin: boolean;
}

export interface AttachmentResponse {
  id: number;
  file_name: string;
  url: string;
}

interface TaskUser {
  id: number;
  full_name: string;
  photo: string;
}

export interface TaskResponse {
  id: number;
  board_id: number;
  title: string;
  description: string;
  status_id: number;
  priority_id: number;
  difficulty_id?: number;
  assignee_id: number;
  assignee?: TaskUser;
  tester_id?: number;
  tester?: TaskUser;
  reporter_id: number;
  reporter?: TaskUser;
  time_spent: number;
  created_at: string;
  updated_at: string;
  attachments?: AttachmentResponse[];
}

export interface BoardStatusResponse {
  board_status_id: number;
  status_id: number;
  name: string;
  code: string;
  position: number;
  colour?: string;
  is_default?: boolean;
}

export interface InviteResponse {
  id: number;
  board_id: number;
  board_name: string;
  inviter_id: number;
  inviter_name?: string;
  invitee_id: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface TimeEstimateResponse {
  estimated_hours: number;
  estimated_label: string;
  explanation: string;
}

// ─── Request types ──────────────────────────────────────────────────────────

export interface CreateBoardRequest {
  name: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority_id?: number;
  difficulty_id?: number;
  assignee_id?: number;
  tester_id?: number;
  files?: File[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status_id?: number;
  priority_id?: number;
  difficulty_id?: number;
  assignee_id?: number | null;
  tester_id?: number | null;
  time_spent?: number;
}

// ─── UI display types ───────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface UITask {
  id: string;
  backendId: number;
  title: string;
  description?: string;
  status: TaskStatus;
  statusId: number;
  priority?: TaskPriority;
  assignedTo: string;
  assigneeId?: number;
  assigneePhoto?: string;
  testerName?: string;
  testerId?: number;
  testerPhoto?: string;
  reporterName?: string;
  reporterId?: number;
  reporterPhoto?: string;
  estimatedTime: string;
  boardId: string;
  attachments: AttachmentResponse[];
}

// ─── Mapping helpers ────────────────────────────────────────────────────────

const STATUS_MAP: Record<number, TaskStatus> = {
  1: "todo",
  2: "in-progress",
  3: "done",
};

const STATUS_TO_ID: Record<TaskStatus, number> = {
  todo: 1,
  "in-progress": 2,
  done: 3,
};

const PRIORITY_MAP: Record<number, TaskPriority> = {
  1: "low",
  2: "medium",
  3: "high",
};

export function taskResponseToUI(
  task: TaskResponse,
  employees: EmployeeResponse[]
): UITask {
  const assignee = task.assignee ?? employees.find((e) => e.id === task.assignee_id);
  const tester = task.tester ?? (task.tester_id ? employees.find((e) => e.id === task.tester_id) : undefined);
  const reporter = task.reporter ?? employees.find((e) => e.id === task.reporter_id);
  return {
    id: String(task.id),
    backendId: task.id,
    title: task.title,
    description: task.description || undefined,
    status: STATUS_MAP[task.status_id] ?? "todo",
    statusId: task.status_id,
    priority: PRIORITY_MAP[task.priority_id] ?? undefined,
    assignedTo: assignee?.full_name ?? `User #${task.assignee_id}`,
    assigneeId: task.assignee_id,
    assigneePhoto: assignee?.photo,
    testerName: tester?.full_name ?? (task.tester_id ? `User #${task.tester_id}` : undefined),
    testerId: task.tester_id,
    testerPhoto: tester?.photo,
    reporterName: reporter?.full_name,
    reporterId: task.reporter_id,
    reporterPhoto: reporter?.photo,
    estimatedTime: task.time_spent ? `${task.time_spent}h` : "",
    boardId: String(task.board_id),
    attachments: task.attachments ?? [],
  };
}

export function statusToId(status: TaskStatus): number {
  return STATUS_TO_ID[status];
}
