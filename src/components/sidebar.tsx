import Link from "next/link";
import { LayoutDashboard, ClipboardCheck, FolderOpen, LayoutGrid } from "lucide-react";
import { getAllUnits, buildUnitTree } from "@/lib/data/units";
import { SidebarTree } from "@/components/sidebar-tree";
import type { Profile } from "@/lib/auth";

const GOLD = "#c9a84c";

function SidebarLink({
  href,
  label,
  badge,
  icon: Icon,
}: {
  href: string;
  label: string;
  badge?: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-2.5 w-full transition-colors text-white/85 hover:bg-white/[0.06] text-[13.5px]"
    >
      <span className="flex items-center gap-2.5 truncate min-w-0">
        {Icon && <Icon className="w-[18px] h-[18px] shrink-0 text-white/50" />}
        <span className="truncate">{label}</span>
      </span>
      {badge !== undefined && (
        <span className="text-[11px] text-white/45 font-medium ml-2 shrink-0">{badge}</span>
      )}
    </Link>
  );
}

export async function Sidebar({ profile, activeUnitId }: { profile: Profile; activeUnitId?: string }) {
  const isQao = profile.role === "qao";

  let treeSection: React.ReactNode = null;
  let totalUnits: number | undefined;

  if (isQao) {
    const units = await getAllUnits();
    const leafUnits = units.filter((u) => u.type !== "college");
    totalUnits = leafUnits.length;
    const tree = buildUnitTree(units);
    treeSection = (
      <SidebarTree
        academics={tree.academics}
        administration={tree.administration}
        activeUnitId={activeUnitId}
        linkPrefix="/dashboard/office"
      />
    );
  }

  return (
    <nav
      className="w-56 shrink-0 overflow-hidden hidden md:flex md:flex-col"
      style={{ background: "#3d0f1f", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* ── QAO section ── */}
      {isQao && (
        <>
          <div className="px-4 pt-5 pb-1">
            <span className="text-[11px] font-bold tracking-[0.04em]" style={{ color: GOLD }}>
              Quality Assurance Office
            </span>
          </div>
          <div className="mt-1">
            <SidebarLink href="/dashboard" label="University dashboard" badge={totalUnits} icon={LayoutDashboard} />
            {profile.unit_id && (
              <SidebarLink href={`/dashboard/office/${profile.unit_id}`} label="QAO Dashboard" icon={ClipboardCheck} />
            )}
            {profile.unit_id && (
              <SidebarLink href={`/repository/${profile.unit_id}`} label="QAO Repository" icon={FolderOpen} />
            )}
          </div>
        </>
      )}

      {/* ── office_user section ── */}
      {!isQao && profile.unit_id && (
        <>
          <div className="px-4 pt-5 pb-1">
            <span className="text-[11px] font-bold tracking-[0.04em]" style={{ color: GOLD }}>
              {profile.unit_name ?? "My Office"}
            </span>
          </div>
          <div className="mt-1">
            <SidebarLink href="/dashboard" label="Dashboard" icon={LayoutGrid} />
            <SidebarLink href={`/repository/${profile.unit_id}`} label="Document repository" icon={FolderOpen} />
          </div>
        </>
      )}

      {/* ── Academics + Administration tree (QAO only) ── */}
      {isQao && (
        <div className="sidebar-tree-scroll flex-1 overflow-y-auto mt-2">
          {treeSection}
        </div>
      )}
    </nav>
  );
}
