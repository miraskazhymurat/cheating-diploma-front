import { axiosInstance } from "./axiosInstance";

export interface CommentResponse {
  id: number;
  task_id: number;
  author_id: number;
  author_full_name: string;
  author_photo?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const commentApi = {
  getByTask: async (taskId: number): Promise<CommentResponse[]> => {
    const res = await axiosInstance.get<{ success: boolean; data: CommentResponse[] }>(`/tasks/${taskId}/comments`);
    return (res as any).data ?? res;
  },

  create: async (taskId: number, content: string): Promise<CommentResponse> => {
    const { data } = await axiosInstance.post<CommentResponse>(`/tasks/${taskId}/comments`, { content });
    return data;
  },

  delete: async (commentId: number): Promise<void> => {
    await axiosInstance.delete(`/comments/${commentId}`);
  },
};
