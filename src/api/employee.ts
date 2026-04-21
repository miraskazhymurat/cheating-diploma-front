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
    const { data } = await axiosInstance.get<EmployeeResponse[]>(`/boards/${id}/members`);
    return data;
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
  }

};
