"use client";

import { useRef, useState, useEffect } from "react";
import { logout } from "@/lib/actions/auth-actions";

export function ProfileDropdown({
  userName,
  role,
  idNumber,
  unitName,
}: {
  userName: string;
  role: string;
  idNumber?: string | null;
  unitName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabel: Record<string, string> = {
    qao: "QAO",
    system_admin: "System Admin",
    office_user: "Office User",
  };

  const trimmed = (userName ?? "").trim();
  const words = trimmed ? trimmed.split(/\s+/) : ["?"];
  const initials = words.length === 1
    ? (words[0][0] ?? "?").toUpperCase()
    : ((words[0][0] ?? "") + (words[words.length - 1][0] ?? "")).toUpperCase() || "?";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-[11px] font-bold shrink-0">
          {initials}
        </div>
        <span className="text-white/80 text-xs hidden sm:inline whitespace-nowrap">{userName}</span>
        <svg
          className={`w-3 h-3 text-white/40 shrink-0 transition-transform hidden sm:block ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
            {idNumber && (
              <p className="text-xs text-gray-400 mt-0.5">ID: {idNumber}</p>
            )}
            {unitName && (
              <p className="text-xs text-gray-400 truncate">{unitName}</p>
            )}
            {!unitName && (
              <p className="text-xs text-gray-400 mt-0.5">{roleLabel[role] ?? role}</p>
            )}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
