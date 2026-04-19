import { axiosInstance } from "./axiosInstance";
import type { BoardResponse, CreateBoardRequest, DashboardResponse } from "./types";

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
};
