import { axiosInstance } from "./axiosInstance";
import type { EmployeeResponse } from "./types";

export const employeeApi = {
  exists: async (): Promise<{ exists: boolean }> => {
    const { data } = await axiosInstance.get("/employees/exists");
    return data;
  },

  getMe: async (): Promise<EmployeeResponse> => {
    const { data } = await axiosInstance.get<EmployeeResponse>("/employees/me");
    return data;
  },

  getAll: async (): Promise<EmployeeResponse[]> => {
    const { data } = await axiosInstance.get<EmployeeResponse[]>("/employees");
    return data;
  },

  getByBoardId: async (id: number): Promise<EmployeeResponse[]> => {
    const res = await axiosInstance.get(`/boards/${id}/members`);
    return ((res as any).data ?? res) as EmployeeResponse[];
  },

  create: async (formData: FormData): Promise<void> => {
    await axiosInstance.post("/employees", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: async (formData: FormData): Promise<void> => {
    await axiosInstance.put("/employees", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteMember: async (boardMemberId: number): Promise<void> => {
    await axiosInstance.delete(`/board-members/${boardMemberId}`);
  },

  getActivities: async (): Promise<{ activities: { date: string; count: number }[]; total_contributions: number; total_active_days: number; max_streak: number; current_streak: number }> => {
    const res = await axiosInstance.get("/employees/me/activities");
    return (res as any).data ?? res;
  },

  getProfile: async (id: number): Promise<{
    profile: EmployeeResponse;
    activities: { activities: { date: string; count: number }[]; total_contributions: number; total_active_days: number; max_streak: number; current_streak: number };
  }> => {
    const res = await axiosInstance.get(`/employees/${id}/profile`);
    const data = (res as any).data ?? res;
    return data;
  },

  getAchievements: async (id: number): Promise<{ achievement_code: string; level: number }[]> => {
    const res = await axiosInstance.get(`/employees/${id}/achievements`);
    return (res as any).data ?? res;
  },
};
