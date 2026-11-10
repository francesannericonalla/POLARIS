import Link from "next/link";
import { LayoutDashboard, ClipboardCheck, FolderOpen, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAllUnits, buildUnitTree } from "@/lib/data/units";
import { SidebarTree } from "@/components/sidebar-tree";
import { logout } from "@/lib/actions/auth-actions";
import type { Profile } from "@/lib/auth";

const NAV_LINKS = (profile: Profile): { label: string; href: string; icon: LucideIcon }[] => [
  { label: "University Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ...(profile.unit_id ? [
    { label: "QAO Dashboard", href: `/dashboard/office/${profile.unit_id}`, icon: ClipboardCheck },
    { label: "QAO Repository", href: `/repository/${profile.unit_id}`, icon: FolderOpen },
  ] : []),
];

export async function QaoSidebar({
  profile,
  activeUnitId,
  activeHref,
}: {
  profile: Profile;
  activeUnitId?: string;
  activeHref?: string;
}) {
  const units = await getAllUnits();
  const tree = buildUnitTree(units);

  const trimmed = (profile.full_name ?? "").trim();
  const words = trimmed ? trimmed.split(/\s+/) : ["?"];
  const initials =
    words.length === 1
      ? (words[0][0] ?? "?").toUpperCase()
      : ((words[0][0] ?? "") + (words[words.length - 1][0] ?? "")).toUpperCase() || "?";

  const navLinks = NAV_LINKS(profile);

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
        <Link href="/dashboard" className="block mb-3">
          <img src="/POLARIS-logo.png" alt="POLARIS" className="h-14 w-auto dark:brightness-90" />
        </Link>
        <p className="text-[11px] font-medium leading-snug" style={{ color: "var(--ou-muted)" }}>
          QAO Compliance &amp; Document Repository
        </p>
      </div>

      {/* ── Top nav links ── */}
      <div className="px-3 pt-4 pb-2 space-y-0.5" style={{ borderBottom: "1px solid var(--ou-sidebar-divider)" }}>
        {navLinks.map(({ label, href, icon: Icon }) => {
          const active = activeHref === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors w-full"
              style={
                active
                  ? { color: "var(--ou-accent)", background: "var(--ou-pill-bg)", fontWeight: 600 }
                  : { color: "var(--ou-sidebar-nav-inactive)" }
              }
            >
              <Icon
                size={16}
                className="shrink-0"
                style={{ color: active ? "var(--ou-accent)" : "var(--ou-sidebar-nav-icon)" }}
              />
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Unit tree (scrollable) ── */}
      <div className="sidebar-tree-scroll flex-1 overflow-y-auto py-2">
        <SidebarTree
          academics={tree.academics}
          administration={tree.administration}
          activeUnitId={activeUnitId}
          linkPrefix="/dashboard/office"
          light
        />
      </div>

      {/* ── Profile + actions ── */}
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
              {profile.full_name}
            </p>
            <p className="text-[11px] leading-tight" style={{ color: "var(--ou-muted)" }}>
              QAO
            </p>
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
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
