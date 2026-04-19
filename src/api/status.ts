import { axiosInstance } from "./axiosInstance";
import type { BoardStatusResponse } from "./types";

export const statusApi = {
  getBoardStatuses: async (boardId: number): Promise<BoardStatusResponse[]> => {
    const { data } = await axiosInstance.get<{ success: boolean; data: BoardStatusResponse[] }>(
      `/boards/${boardId}/statuses`
    );
    return data;
  },

  create: async (payload: { board_id: number; title: string }): Promise<BoardStatusResponse> => {
    const { data } = await axiosInstance.post<BoardStatusResponse>("/statuses", payload);
    return data;
  },

  update: async (boardStatusId: number, payload: { colour?: string; title?: string }): Promise<BoardStatusResponse> => {
    const { data } = await axiosInstance.patch<BoardStatusResponse>(`/statuses/${boardStatusId}`, payload);
    return data;
  },

  delete: async (boardStatusId: number): Promise<void> => {
    await axiosInstance.delete(`/statuses/${boardStatusId}`);
  },

  reorder: async (statuses: { board_status_id: number; position: number }[]): Promise<void> => {
    await axiosInstance.patch("/statuses/reorder", { statuses });
  },
};
