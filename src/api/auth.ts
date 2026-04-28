import { axiosInstance } from "./axiosInstance";
import type { LoginResponse } from "./types";

export const authApi = {
  register: async (email: string, password: string): Promise<void> => {
    await axiosInstance.post("/auth/register", { email, password });
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>("/auth/login", { email, password });
    return data;
  },
};
