import { api } from "./axios";

export const reportApi = {
  sales: (from: string, to: string) =>
    api.get("/reports/sales", { params: { from, to } }).then((r) => r.data),
  sessions: (params?: object) =>
    api.get("/reports/sessions", { params }).then((r) => r.data),
  staff: (from: string, to: string) =>
    api.get("/reports/staff", { params: { from, to } }).then((r) => r.data),
  devices: (from: string, to: string) =>
    api.get("/reports/devices", { params: { from, to } }).then((r) => r.data),
};
