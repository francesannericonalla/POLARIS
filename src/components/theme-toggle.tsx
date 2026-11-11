"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 group ${className ?? ""}`}
      style={{ color: "var(--ou-sidebar-nav-inactive)" }}
    >
      <span className="flex items-center gap-2.5">
        <span
          className="flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300"
          style={{
            background: isDark ? "rgba(192,105,126,0.15)" : "rgba(100,116,139,0.1)",
            color: isDark ? "#c0697e" : "#64748b",
          }}
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </span>
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>

      {/* Animated pill toggle */}
      <span
        className="relative flex items-center w-9 h-5 rounded-full shrink-0 transition-colors duration-300"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #c0697e, #8f3f52)"
            : "rgba(100,116,139,0.2)",
        }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-all duration-300"
          style={{
            left: isDark ? "calc(100% - 1.125rem)" : "0.125rem",
            background: isDark ? "#fff" : "rgba(255,255,255,0.9)",
          }}
        />
      </span>
    </button>
  );
}
