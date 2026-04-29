import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getPublicSettings, type PublicSettings } from "../api/settings";

interface SiteSettingsContextType {
  settings: PublicSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultSettings: PublicSettings = {
  siteName: "Gamers Den",
  tagline: "The Ultimate Gaming Destination",
  description:
    "The ultimate gaming destination. Experience high-end gaming PCs with RTX GPUs, PS5 & PS4 Pro consoles, thrilling sim racing, and a premium snacks corner for the complete gaming lifestyle.",
  footerDescription:
    "The Ultimate Gaming Experience in Bangladesh. Your premier gaming destination featuring cutting-edge technology, esports tournaments, and an unmatched gaming atmosphere.",
  copyright: "Crafted for gamers, by gamers. Powered by passion.",
  contact: {
    ownerName: "M A Tanzeel",
    phone: "01754659997",
    whatsapp: "+880 1754659997",
    email: "rhosnain@gmail.com",
    address:
      "Allama Iqbal Road Jame Mosque Market, Chashara, Narayanganj, Bangladesh",
    googleMapsEmbedUrl: "",
    googleMapsUrl: "https://www.google.com/maps/place/JFCX%2BG6+Narayanganj",
    facebookUrl: "https://www.facebook.com/Gamersdenbd/",
    messengerUrl: "https://m.me/Gamersdenbd",
  },
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: false,
  error: null,
  refetch: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings | null>(
    defaultSettings,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicSettings();
      setSettings(data);
    } catch {
      // Use defaults on error
      setSettings(defaultSettings);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{ settings, loading, error, refetch: fetchSettings }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
