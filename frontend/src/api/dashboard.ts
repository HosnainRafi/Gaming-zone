import { api } from "./axios";

export interface DashboardStats {
  revenue: { today: number; week: number; month: number; year: number };
  sessions: { active: number };
  devices: {
    total: number;
    available: number;
    running: number;
    maintenance: number;
    disabled: number;
  };
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard").then((r) => r.data),
};
