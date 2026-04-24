import { axiosInstance } from "./axiosInstance";

export interface ChatMessage {
  id: number;
  board_id: number;
  user_id: number;
  author_name: string;
  author_photo?: string;
  content: string;
  created_at: string;
}

export const chatApi = {
  getMessages: async (boardId: number): Promise<ChatMessage[]> => {
    const res = await axiosInstance.get(`/boards/${boardId}/chat`);
    return (res as any).data ?? res;
  },

  sendMessage: async (boardId: number, content: string): Promise<ChatMessage> => {
    const res = await axiosInstance.post(`/boards/${boardId}/chat`, { content });
    return (res as any).data ?? res;
  },
};
