import { api } from "./axios";

export type OfferType = "PERCENT" | "FIXED" | "TIME_BASED";

export interface Offer {
  id: string;
  code: string;
  type: OfferType;
  value: number;
  freeMinutes: number | null;
  expiry: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: { id: string; name: string | null } | null;
  updatedBy?: { id: string; name: string | null } | null;
}

export interface OfferValidation {
  code: string;
  type: OfferType;
  value: number;
  freeMinutes: number | null;
  discount: number;
  finalAmount: number;
}

export const offerApi = {
  list: () => api.get<Offer[]>("/offers").then((r) => r.data),
  create: (data: {
    code: string;
    type: OfferType;
    value: number;
    expiry: string;
    freeMinutes?: number;
  }) => api.post<Offer>("/offers", data).then((r) => r.data),
  update: (id: string, data: Partial<Offer>) =>
    api.put<Offer>(`/offers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/offers/${id}`),
  validate: (
    code: string,
    baseAmount: number,
    durationMinutes?: number,
    hourlyRate?: number,
  ) =>
    api
      .post<OfferValidation>("/offers/validate", {
        code,
        baseAmount,
        durationMinutes,
        hourlyRate,
      })
      .then((r) => r.data),
};
