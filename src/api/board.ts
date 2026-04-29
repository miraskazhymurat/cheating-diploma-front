import { axiosInstance } from "./axiosInstance";
import type { BoardResponse, CreateBoardRequest, DashboardResponse } from "./types";

export interface NotionImportRequest {
  database_id: string;
  token: string;
}

export interface MemberStat {
  user_id: number;
  hard_tasks: number;
  completed_tasks: number;
  polls_created: number;
  messages_sent: number;
}

export const boardApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const { data } = await axiosInstance.get<DashboardResponse>("/dashboard");
    return data;
  },

  getById: async (id: number): Promise<BoardResponse> => {
    const { data } = await axiosInstance.get<BoardResponse>(`/boards/${id}`);
    return data;
  },

  create: async (payload: CreateBoardRequest): Promise<BoardResponse> => {
    const { data } = await axiosInstance.post<BoardResponse>("/boards", payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/boards/${id}`);
  },

  importFromNotion: async (notionDatabaseId: string): Promise<BoardResponse> => {
    const { data } = await axiosInstance.post<BoardResponse>("/boards/notion", {
      notion_database_id: notionDatabaseId,
    });
    return data;
  },

  importFromNotionV2: async (payload: NotionImportRequest): Promise<BoardResponse> => {
    const { data } = await axiosInstance.post<BoardResponse>("/notion/import", {
      board_id: 0,
      database_id: payload.database_id,
      token: payload.token,
    });
    return data;
  },

  getMemberStats: async (boardId: number): Promise<MemberStat[]> => {
    const { data } = await axiosInstance.get<MemberStat[]>(`/boards/${boardId}/member-stats`);
    return data;
  },

  update: async (id: number, payload: { name: string; description: string }): Promise<BoardResponse> => {
    const { data } = await axiosInstance.patch<BoardResponse>(`/boards/${id}`, payload);
    return data;
  },
};
