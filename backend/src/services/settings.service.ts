import { prisma } from "../prisma/client";

// Default site settings
const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "Gamers Den",
  tagline: "The Ultimate Gaming Destination",
  description:
    "The ultimate gaming destination. Experience high-end gaming PCs with RTX GPUs, PS5 & PS4 Pro consoles, thrilling sim racing, and a premium snacks corner for the complete gaming lifestyle.",
  footerDescription:
    "The Ultimate Gaming Experience in Bangladesh. Your premier gaming destination featuring cutting-edge technology, esports tournaments, and an unmatched gaming atmosphere.",
  copyright: "Crafted for gamers, by gamers. Powered by passion.",
  ownerName: "M A Tanzeel",
  phone: "01754659997",
  whatsapp: "+880 1754659997",
  email: "rhosnain@gmail.com",
  address:
    "Allama Iqbal Road Jame Mosque Market, Chashara, Narayanganj, Bangladesh",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.123!2d90.5!3d23.62!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDM3JzEyLjAiTiA5MMKwMzAnMDAuMCJF!5e0!3m2!1sen!2sbd!4v1234567890",
  googleMapsUrl: "https://www.google.com/maps/place/JFCX%2BG6+Narayanganj",
  facebookUrl: "https://www.facebook.com/Gamersdenbd/",
  messengerUrl: "https://m.me/Gamersdenbd",
};

export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({ where: { key } });
  return setting?.value ?? DEFAULT_SETTINGS[key] ?? "";
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.siteSettings.findMany();
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };

  for (const setting of settings) {
    result[setting.key] = setting.value;
  }

  return result;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function updateSettings(
  settings: Record<string, string>,
): Promise<void> {
  const operations = Object.entries(settings).map(([key, value]) =>
    prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    }),
  );

  await prisma.$transaction(operations);
}

export async function getPublicSettings() {
  const settings = await getAllSettings();
  return {
    siteName: settings.siteName,
    tagline: settings.tagline,
    description: settings.description,
    footerDescription: settings.footerDescription,
    copyright: settings.copyright,
    contact: {
      ownerName: settings.ownerName,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      address: settings.address,
      googleMapsEmbedUrl: settings.googleMapsEmbedUrl,
      googleMapsUrl: settings.googleMapsUrl,
      facebookUrl: settings.facebookUrl,
      messengerUrl: settings.messengerUrl,
    },
  };
}
