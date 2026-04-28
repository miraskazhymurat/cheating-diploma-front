import { axiosInstance } from "./axiosInstance";
import type { BoardResponse, CreateBoardRequest, DashboardResponse } from "./types";

export interface NotionImportRequest {
  database_id: string;
  token: string;
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
};
