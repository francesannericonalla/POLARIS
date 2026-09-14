import { PolarisLogo } from "@/components/polaris-logo";
import { ProfileDropdown } from "@/components/profile-dropdown";
import Link from "next/link";

export function Topbar({
  title,
  userName,
  role,
  idNumber,
  unitName,
  navLinks,
}: {
  title: string;
  userName: string;
  role: string;
  idNumber?: string | null;
  unitName?: string | null;
  navLinks?: { label: string; href: string }[];
}) {
  return (
    <header className="h-[64px] bg-maroon-dark flex items-center justify-between px-6 shrink-0 shadow-md">
      {/* Left: logo + nav links */}
      <div className="flex items-center gap-1 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0 mr-4">
          <PolarisLogo size={26} />
          <span className="text-gold font-bold text-base tracking-widest uppercase">POLARIS</span>
        </div>
        {navLinks && navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hidden md:block text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {l.label}
          </Link>
        ))}
      </div>
      {/* Right: page title + profile dropdown */}
      <div className="flex items-center gap-3 shrink-0 min-w-0">
        {title && (
          <span className="text-white/40 text-xs hidden lg:inline whitespace-nowrap">{title}</span>
        )}
        <ProfileDropdown userName={userName} role={role} idNumber={idNumber} unitName={unitName} />
      </div>
    </header>
  );
}
