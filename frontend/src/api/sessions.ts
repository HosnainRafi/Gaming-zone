import { api } from "./axios";
import type { Device } from "./devices";

export type PaymentMethod = "CASH" | "CARD" | "MOBILE_WALLET" | "OTHER";
export type SessionStatus = "ACTIVE" | "COMPLETED" | "CANCELED";
export type SessionPricingType = "STANDARD" | "MEMBERSHIP" | "FIRST_TIME_FREE";

export interface Session {
  id: string;
  deviceId: string;
  staffId: string;
  customerId: string | null;
  membershipId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  playerCount: number;
  pricingType: SessionPricingType;
  baseAmount: number;
  appliedDiscount: number;
  totalAmount: number;
  appliedOfferCode: string | null;
  status: SessionStatus;
  createdAt: string;
  device: Device;
  staff: { id: string; name: string | null };
  customer?: { id: string; name: string; phone: string } | null;
  membership?: {
    id: string;
    planName?: string | null;
    planType?: string | null;
    price: number;
    remainingMinutes: number;
    expiresAt: string;
  } | null;
  transaction: {
    id: string;
    receiptNumber: number;
    amount: number;
    discount: number;
    cashPaid: number;
    paymentMethod: PaymentMethod;
    createdAt: string;
  } | null;
}

export interface StartSessionPayload {
  deviceId: string;
  durationMinutes: number;
  pricingType: SessionPricingType;
  paymentMethod: PaymentMethod;
  offerCode?: string;
  customerName: string;
  customerPhone?: string;
  playerCount: number;
  cashPaid?: number;
}

export interface SessionsResponse {
  sessions: Session[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const sessionApi = {
  start: (data: StartSessionPayload) =>
    api.post<Session>("/sessions/start", data).then((r) => r.data),
  active: () => api.get<Session[]>("/sessions/active").then((r) => r.data),
  get: (id: string) => api.get<Session>(`/sessions/${id}`).then((r) => r.data),
  list: (params?: object) =>
    api.get<SessionsResponse>("/sessions", { params }).then((r) => r.data),
  delete: (id: string) => api.delete(`/sessions/${id}`),
};
