"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { logout } from "@/lib/actions/auth-actions";

export function AdminNavbar({
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

  const trimmed = (userName ?? "").trim();
  const words = trimmed ? trimmed.split(/\s+/) : ["?"];
  const initials =
    words.length === 1
      ? (words[0][0] ?? "?").toUpperCase()
      : ((words[0][0] ?? "") + (words[words.length - 1][0] ?? "")).toUpperCase() || "?";

  return (
    <header className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
      {/* Left: Logo + nav label */}
      <div className="flex items-center gap-6">
        <Link href="/admin/accounts" className="flex items-center">
          <Image src="/POLARIS-logo.png" alt="POLARIS" width={120} height={40} className="h-10 w-auto" />
        </Link>

        <div className="hidden sm:flex items-center">
          <div className="w-px h-5 bg-gray-200 mr-5" />
          <span className="text-sm font-semibold text-gray-700">Account Management</span>
        </div>
      </div>

      {/* Right: Super Admin profile dropdown */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-maroon/10 border border-maroon/20 flex items-center justify-center text-maroon text-[12px] font-bold shrink-0">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline whitespace-nowrap">
            Super Admin
          </span>
          <svg
            className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform hidden sm:block ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
              {idNumber && <p className="text-xs text-gray-400 mt-0.5">ID: {idNumber}</p>}
              <p className="text-xs text-gray-400 mt-0.5">System Administrator</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Log Out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
