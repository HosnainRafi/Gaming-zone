import { api } from "./axios";

export type DeviceStatus = "AVAILABLE" | "RUNNING" | "MAINTENANCE" | "DISABLED";

export interface Device {
  id: string;
  name: string;
  type: string;
  hourlyRate: number;
  status: DeviceStatus;
  createdAt: string;
}

export const deviceApi = {
  list: () => api.get<Device[]>("/devices").then((r) => r.data),
  get: (id: string) => api.get<Device>(`/devices/${id}`).then((r) => r.data),
  create: (data: { name: string; type: string; hourlyRate: number }) =>
    api.post<Device>("/devices", data).then((r) => r.data),
  update: (id: string, data: Partial<Device>) =>
    api.put<Device>(`/devices/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/devices/${id}`),
};
