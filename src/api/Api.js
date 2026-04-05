import axios from 'axios';

let is_local = false;
let domain = is_local ? "http://192.168.100.22:8080" : "http://localhost:7777";
const Url = `${domain}`;

// Create axios instance with token
const axiosInstance = axios.create();

// Add token to requests if it exists
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default class Api {
    static register(userData) {
        return axios.post(`${Url}/auth/register`, userData)
            .then(response => response.data);
    }

    static login(credentials) {
        return axios.post(`${Url}/auth/login`, credentials)
            .then(response => {
                // Store token if provided in response
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                }
                return response.data;
            });
    }

    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    static getAuthToken() {
        return localStorage.getItem('authToken');
    }

    static isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    static getCurrentUser() {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        return axiosInstance.get(`${Url}/auth/me`)
            .then(response => response.data);
    }

    static getDashboardData() {
        return axiosInstance.get(`${Url}/dashboard`)
            .then(response => response.data);
    }
}