import { api } from "./axios";

export interface SiteContact {
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsEmbedUrl: string;
  googleMapsUrl: string;
  facebookUrl: string;
  messengerUrl: string;
}

export interface PublicSettings {
  siteName: string;
  tagline: string;
  description: string;
  footerDescription: string;
  copyright: string;
  contact: SiteContact;
}

export interface AllSettings {
  siteName: string;
  tagline: string;
  description: string;
  footerDescription: string;
  copyright: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsEmbedUrl: string;
  googleMapsUrl: string;
  facebookUrl: string;
  messengerUrl: string;
  [key: string]: string;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const { data } = await api.get<PublicSettings>("/settings/public");
  return data;
}

export async function getAllSettings(): Promise<AllSettings> {
  const { data } = await api.get<AllSettings>("/settings");
  return data;
}

export async function updateSettings(
  settings: Partial<AllSettings>,
): Promise<AllSettings> {
  const { data } = await api.patch<AllSettings>("/settings", settings);
  return data;
}
