
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-primary hover:bg-opacity-10 focus:outline-none group"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-[#7A9992] dark:text-[#CCCCCC] group-hover:text-[#14A090]" />
      ) : (
        <Sun className="h-5 w-5 text-[#7A9992] dark:text-[#CCCCCC] group-hover:text-[#14A090]" />
      )}
    </button>
  );
}
