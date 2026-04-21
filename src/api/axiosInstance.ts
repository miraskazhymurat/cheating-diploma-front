import axios from "axios";

export const BASE_URL = "http://192.168.100.32:8080";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    return Promise.reject(new Error(message));
  }
);
