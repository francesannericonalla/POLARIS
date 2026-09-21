import Link from "next/link";
import { PolarisLogo } from "@/components/polaris-logo";
import { ProfileDropdown } from "@/components/profile-dropdown";

export function Topbar({
  userName,
  role,
  idNumber,
  unitName,
  navLinks,
}: {
  title?: string;
  userName: string;
  role: string;
  idNumber?: string | null;
  unitName?: string | null;
  navLinks?: { label: string; href: string }[];
}) {
  return (
    <header
      className="h-[56px] flex items-center justify-between px-5 shrink-0"
      style={{ background: "#3d0f1f", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo + optional nav links */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <PolarisLogo size={28} />
          <span
            className="font-bold text-[15px] tracking-widest uppercase"
            style={{ color: "#E8C66E", fontFamily: "var(--font-poppins)" }}
          >
            POLARIS
          </span>
        </div>

        {navLinks && navLinks.length > 0 && (
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-[13.5px] font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <ProfileDropdown userName={userName} role={role} idNumber={idNumber} unitName={unitName} />
    </header>
  );
}
