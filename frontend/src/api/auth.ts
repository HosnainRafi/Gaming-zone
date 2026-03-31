import { api } from "./axios";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "STAFF";
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    api
      .post<LoginResponse>("/auth/login", { email, password })
      .then((r) => r.data),

  register: (data: {
    email: string;
    password: string;
    name: string;
    role: "ADMIN" | "STAFF";
  }) => api.post<AuthUser>("/auth/register", data).then((r) => r.data),

  me: () => api.get<AuthUser>("/auth/me").then((r) => r.data),

  updateMe: (data: { email?: string; password?: string; name?: string }) =>
    api.put<AuthUser>("/auth/me", data).then((r) => r.data),

  staff: () => api.get<AuthUser[]>("/auth/staff").then((r) => r.data),

  updateStaff: (
    id: string,
    data: {
      email?: string;
      password?: string;
      name?: string;
      role?: "ADMIN" | "STAFF";
    },
  ) => api.put<AuthUser>(`/auth/staff/${id}`, data).then((r) => r.data),

  deleteStaff: (id: string) => api.delete(`/auth/staff/${id}`),
};
