import { axiosInstance } from "./axiosInstance";
import type { InviteResponse } from "./types";

export const inviteApi = {
  getAll: async (): Promise<InviteResponse[]> => {
    const { data } = await axiosInstance.get<InviteResponse[]>("/invites");
    return data;
  },

  accept: async (inviteId: number): Promise<void> => {
    await axiosInstance.post(`/invites/${inviteId}/accept`);
  },

  reject: async (inviteId: number): Promise<void> => {
    await axiosInstance.post(`/invites/${inviteId}/reject`);
  },

  send: async (boardId: number, userId: number): Promise<void> => {
    await axiosInstance.post(`/boards/${boardId}/invite`, { user_id: userId });
  },
};
