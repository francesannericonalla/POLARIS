"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ClipboardList, LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth-actions";

const NAV_LINKS = [
  { label: "Accounts", href: "/admin/accounts", icon: Users },
  { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList },
];

export function AdminNavbar({
  userName,
  idNumber,
}: {
  userName: string;
  role: string;
  idNumber?: string | null;
  unitName?: string | null;
}) {
  const pathname = usePathname();

  const trimmed = (userName ?? "").trim();
  const words = trimmed ? trimmed.split(/\s+/) : ["?"];
  const initials =
    words.length === 1
      ? (words[0][0] ?? "?").toUpperCase()
      : ((words[0][0] ?? "") + (words[words.length - 1][0] ?? "")).toUpperCase() || "?";

  return (
    <nav
      className="w-[230px] shrink-0 h-full flex flex-col"
      style={{
        background: "var(--ou-sidebar-bg)",
        borderRight: "1px solid var(--ou-sidebar-border)",
      }}
    >
      {/* ── Logo ── */}
      <div className="px-6 pt-7 pb-5" style={{ borderBottom: "1px solid var(--ou-sidebar-divider)" }}>
        <Link href="/admin/accounts" className="block mb-3">
          <img src="/POLARIS-logo.png" alt="POLARIS" className="h-14 w-auto" />
        </Link>
        <p className="text-[11px] font-medium leading-snug" style={{ color: "var(--ou-muted)" }}>
          System Administration
        </p>
      </div>

      {/* ── Nav links ── */}
      <div className="flex-1 px-3 pt-5 space-y-1 overflow-y-auto">
        {NAV_LINKS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors w-full"
              style={
                active
                  ? { color: "var(--ou-accent)", background: "var(--ou-pill-bg)", fontWeight: 600 }
                  : { color: "var(--ou-sidebar-nav-inactive)" }
              }
            >
              <Icon
                size={17}
                className="shrink-0"
                style={{ color: active ? "var(--ou-accent)" : "var(--ou-sidebar-nav-icon)" }}
              />
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Profile + logout ── */}
      <div className="px-4 pb-5 pt-4" style={{ borderTop: "1px solid var(--ou-sidebar-divider)" }}>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
            style={{ background: "#79132F", color: "#fff" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: "var(--ou-heading)" }}>
              {userName}
            </p>
            {idNumber && (
              <p className="text-[11px] leading-tight" style={{ color: "var(--ou-muted)" }}>
                ID {idNumber}
              </p>
            )}
            {!idNumber && (
              <p className="text-[11px] leading-tight" style={{ color: "var(--ou-muted)" }}>
                System Admin
              </p>
            )}
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-red-50 hover:text-red-500"
            style={{ color: "var(--ou-sidebar-nav-inactive)" }}
          >
            <LogOut size={15} className="shrink-0" />
            Log Out
          </button>
        </form>
      </div>
    </nav>
  );
}
