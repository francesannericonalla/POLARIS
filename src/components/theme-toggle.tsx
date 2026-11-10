"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 ${className ?? ""}`}
    >
      {theme === "dark" ? (
        <Sun size={15} className="shrink-0 text-amber-400" />
      ) : (
        <Moon size={15} className="shrink-0" />
      )}
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
