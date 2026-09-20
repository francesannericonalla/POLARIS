import Link from "next/link";
import { PolarisLogo } from "@/components/polaris-logo";
import { ProfileDropdown } from "@/components/profile-dropdown";

const GOLD = "#E8C66E";

export function OfficeUserTopbar({
  userName,
  role,
  idNumber,
  unitName,
  unitId,
  activeHref,
}: {
  userName: string;
  role: string;
  idNumber?: string | null;
  unitName?: string | null;
  unitId: string;
  activeHref?: string;
}) {
  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Repository", href: `/repository/${unitId}` },
  ];

  return (
    <header
      className="h-[56px] flex items-center justify-between px-5 shrink-0"
      style={{ background: "#3d0f1f", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo + nav links */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <PolarisLogo size={28} />
          <span
            className="font-bold text-[15px] tracking-widest uppercase"
            style={{ color: GOLD, fontFamily: "var(--font-poppins)" }}
          >
            POLARIS
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-[13.5px] font-medium transition-colors"
                style={
                  isActive
                    ? { color: GOLD, background: "rgba(255,255,255,0.08)" }
                    : { color: "rgba(255,255,255,0.75)" }
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <ProfileDropdown userName={userName} role={role} idNumber={idNumber} unitName={unitName} />
    </header>
  );
}
