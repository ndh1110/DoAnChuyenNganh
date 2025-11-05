// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",         // dựa trên proxy Vite → http://localhost:5000
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ----- Request interceptor: đính kèm token (nếu có) -----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // TODO: cập nhật theo cơ chế auth của bạn
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ----- Response interceptor: xử lý lỗi tập trung -----
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // Ví dụ: phát sự kiện để trang chủ có thể lắng nghe và chuyển hướng đến /login
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
