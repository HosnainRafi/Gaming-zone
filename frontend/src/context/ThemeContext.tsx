import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Toaster } from "react-hot-toast";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("gz_theme") as Theme) || "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("gz_theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? "#13131f" : "#ffffff",
            color: isDark ? "#e2e8f0" : "#0f172a",
            border: isDark ? "1px solid #1e1e30" : "1px solid #dee4ec",
            fontFamily: "Inter, sans-serif",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: isDark ? "#13131f" : "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: isDark ? "#13131f" : "#ffffff",
            },
          },
        }}
      />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
