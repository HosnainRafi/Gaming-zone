import { api } from "./axios";

export interface MembershipRecord {
  id: string;
  planName?: string | null;
  planType?: string | null;
  price: number;
  maxMinutes: number;
  remainingMinutes: number;
  remainingHours: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  maxMinutes: number;
  maxHours: number;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberLookup {
  id: string;
  name: string;
  phone: string;
  hasClaimedFirstFree: boolean;
  activeMembership: MembershipRecord | null;
  memberships: MembershipRecord[];
}

export interface MemberListItem {
  id: string;
  name: string;
  phone: string;
  hasClaimedFirstFree: boolean;
  latestMembership: MembershipRecord | null;
}

export const membershipApi = {
  list: (query?: string) =>
    api
      .get<MemberListItem[]>("/memberships", {
        params: query ? { query } : undefined,
      })
      .then((r) => r.data),

  lookup: (phone: string) =>
    api.get<MemberLookup>(`/memberships/lookup/${phone}`).then((r) => r.data),

  listPlans: () =>
    api.get<MembershipPlan[]>("/memberships/plans").then((r) => r.data),

  purchase: (data: { name: string; phone: string; planId: string }) =>
    api.post("/memberships/purchase", data).then((r) => r.data),

  createPlan: (data: {
    name: string;
    price: number;
    maxHours: number;
    durationDays: number;
    isActive?: boolean;
    sortOrder?: number;
  }) =>
    api.post<MembershipPlan>("/memberships/plans", data).then((r) => r.data),

  updatePlan: (
    id: string,
    data: {
      name?: string;
      price?: number;
      maxHours?: number;
      durationDays?: number;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) =>
    api
      .put<MembershipPlan>(`/memberships/plans/${id}`, data)
      .then((r) => r.data),

  deletePlan: (id: string) => api.delete(`/memberships/plans/${id}`),
};
