"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PolarisLogo } from "@/components/polaris-logo";
import { ProfileDropdown } from "@/components/profile-dropdown";

const GOLD = "#c9a84c";

const NAV = [
  {
    href: "/admin/approvals",
    label: "Account Approvals",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/accounts",
    label: "All Accounts",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6-4a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function AdminSidebar({
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
  const pathname = usePathname();

  return (
    <nav
      className="w-56 shrink-0 hidden md:flex md:flex-col h-full"
      style={{ background: "#3d0f1f", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Logo */}
      <div
        className="h-[56px] flex items-center gap-2.5 px-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <PolarisLogo size={26} />
        <span
          className="font-bold text-[14px] tracking-widest uppercase"
          style={{ color: GOLD, fontFamily: "var(--font-poppins)" }}
        >
          POLARIS
        </span>
      </div>

      {/* Section label */}
      <div className="px-4 pt-5 pb-1">
        <span className="text-[11px] font-bold tracking-[0.04em]" style={{ color: GOLD }}>
          System Administration
        </span>
      </div>

      {/* Nav links */}
      <div className="mt-1 flex-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 w-full transition-colors text-[13.5px]"
              style={{
                color: active ? "#fff" : "rgba(255,255,255,0.7)",
                background: active ? "rgba(255,255,255,0.09)" : undefined,
                borderLeft: active ? `2px solid ${GOLD}` : "2px solid transparent",
              }}
            >
              <span style={{ color: active ? GOLD : "rgba(255,255,255,0.45)" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Profile at bottom */}
      <div
        className="px-4 py-4 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: GOLD, color: "#3d0f1f" }}
          >
            {userName?.charAt(0)?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white/90 truncate">{userName}</p>
            <p className="text-[10px] text-white/40 truncate">System Admin</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function AdminShell({
  userName,
  role,
  idNumber,
  unitName,
  children,
}: {
  userName: string;
  role: string;
  idNumber?: string | null;
  unitName?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      <AdminSidebar userName={userName} role={role} idNumber={idNumber} unitName={unitName} />

      {/* Right side: topbar + content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="h-[56px] flex items-center justify-between px-6 shrink-0"
          style={{ background: "#3d0f1f", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
              System Administration
            </span>
          </div>
          <ProfileDropdown userName={userName} role={role} idNumber={idNumber} unitName={unitName} />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#f0f2f5]">{children}</main>
      </div>
    </div>
  );
}
