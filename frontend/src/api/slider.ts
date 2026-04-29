import { api } from "./axios";

export interface SliderImage {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSliderInput {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateSliderInput {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export async function getSliderImages(all = false): Promise<SliderImage[]> {
  const { data } = await api.get<SliderImage[]>(
    all ? "/slider/admin" : "/slider",
  );
  return data;
}

export async function getSliderImage(id: string): Promise<SliderImage> {
  const { data } = await api.get<SliderImage>(`/slider/admin/${id}`);
  return data;
}

export async function createSliderImage(
  input: CreateSliderInput,
): Promise<SliderImage> {
  const { data } = await api.post<SliderImage>("/slider", input);
  return data;
}

export async function updateSliderImage(
  id: string,
  input: UpdateSliderInput,
): Promise<SliderImage> {
  const { data } = await api.patch<SliderImage>(`/slider/${id}`, input);
  return data;
}

export async function deleteSliderImage(id: string): Promise<void> {
  await api.delete(`/slider/${id}`);
}
