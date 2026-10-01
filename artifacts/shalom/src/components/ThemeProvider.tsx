import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("shalom-theme", theme);
    } catch {
      /* Storage may be unavailable. */
    }
  }, [theme]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === "shalom-theme")
        setTheme(event.newValue === "dark" ? "dark" : "light");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: () =>
          setTheme((current) => (current === "light" ? "dark" : "light")),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeToggle must be inside ThemeProvider");
  const { theme, toggleTheme } = context;
  const label = `Switch to ${theme === "light" ? "dark" : "light"} mode`;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-foreground hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
