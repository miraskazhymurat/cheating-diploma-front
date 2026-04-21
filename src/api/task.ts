import { axiosInstance } from "./axiosInstance";
import type { AttachmentResponse, CreateTaskRequest, TaskResponse, UpdateTaskRequest } from "./types";

export const taskApi = {
  getBoardTasks: async (boardId: number): Promise<TaskResponse[]> => {
    const { data } = await axiosInstance.get<TaskResponse[]>(
      `/boards/${boardId}/tasks`
    );
    return data;
  },

  create: async (
    boardId: number,
    payload: CreateTaskRequest
  ): Promise<TaskResponse> => {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    if (payload.priority_id != null) form.append("priority_id", String(payload.priority_id));
    if (payload.difficulty_id != null) form.append("difficulty_id", String(payload.difficulty_id));
    if (payload.assignee_id != null) form.append("assignee_id", String(payload.assignee_id));
    if (payload.tester_id != null) form.append("tester_id", String(payload.tester_id));
    payload.files?.forEach((file) => form.append("attachments", file));

    const { data } = await axiosInstance.post<TaskResponse>(`/boards/${boardId}/tasks`, form);
    return data;
  },

  deleteAttachment: async (attachmentId: number): Promise<void> => {
    await axiosInstance.delete(`/attachments/${attachmentId}`);
  },

  uploadAttachment: async (taskId: number, file: File): Promise<AttachmentResponse> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axiosInstance.post<AttachmentResponse>(
      `/tasks/${taskId}/attachments`,
      form
    );
    return data;
  },

  delete: async (taskId: number): Promise<void> => {
    await axiosInstance.delete(`/tasks/${taskId}`);
  },

  update: async (
    taskId: number,
    payload: UpdateTaskRequest
  ): Promise<TaskResponse> => {
    const { data } = await axiosInstance.patch<TaskResponse>(
      `/tasks/${taskId}`,
      payload
    );
    return data;
  },
};
