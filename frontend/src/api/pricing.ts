import { api } from "./axios";

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  perUnit: string;
  description: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingInput {
  name: string;
  price: number;
  perUnit?: string;
  description?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePricingInput {
  name?: string;
  price?: number;
  perUnit?: string;
  description?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export async function getPricingTiers(all = false): Promise<PricingTier[]> {
  const { data } = await api.get<PricingTier[]>(
    all ? "/pricing/admin" : "/pricing",
  );
  return data;
}

export async function getPricingTier(id: string): Promise<PricingTier> {
  const { data } = await api.get<PricingTier>(`/pricing/admin/${id}`);
  return data;
}

export async function createPricingTier(
  input: CreatePricingInput,
): Promise<PricingTier> {
  const { data } = await api.post<PricingTier>("/pricing", input);
  return data;
}

export async function updatePricingTier(
  id: string,
  input: UpdatePricingInput,
): Promise<PricingTier> {
  const { data } = await api.patch<PricingTier>(`/pricing/${id}`, input);
  return data;
}

export async function deletePricingTier(id: string): Promise<void> {
  await api.delete(`/pricing/${id}`);
}
