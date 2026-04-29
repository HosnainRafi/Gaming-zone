import { api } from "./axios";

export interface DashboardTrendPoint {
  date: string;
  label: string;
  revenue: number;
  sessions: number;
}

export interface DashboardBreakdownItem {
  label: string;
  amount: number;
  count: number;
}

export interface DashboardDeviceLeader {
  deviceId: string;
  name: string;
  type: string;
  sessions: number;
  revenue: number;
}

export interface DashboardStaffLeader {
  staffId: string;
  name: string;
  sessions: number;
  revenue: number;
}

export interface DashboardStats {
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
    avgSaleToday: number;
  };
  sessions: {
    active: number;
    completedToday: number;
    hoursToday: number;
    avgDurationToday: number;
  };
  devices: {
    total: number;
    available: number;
    running: number;
    maintenance: number;
    disabled: number;
    occupancyPct: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    checkedInToday: number;
  };
  memberships: {
    active: number;
    soldThisMonth: number;
  };
  trends: {
    last7Days: DashboardTrendPoint[];
  };
  paymentMethods: DashboardBreakdownItem[];
  topDevices: DashboardDeviceLeader[];
  staffLeaderboard: DashboardStaffLeader[];
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard").then((r) => r.data),
};
