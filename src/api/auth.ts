import axios from "axios";
import { BASE_URL } from "./axiosInstance";
import type { LoginResponse } from "./types";

export const authApi = {
  register: async (email: string, password: string): Promise<void> => {
    await axios.post(`${BASE_URL}/auth/register`, { email, password });
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await axios.post<LoginResponse>(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return data;
  },
};
