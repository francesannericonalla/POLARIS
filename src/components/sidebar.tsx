import Link from "next/link";
import { getAllUnits, buildUnitTree } from "@/lib/data/units";
import { SidebarTree } from "@/components/sidebar-tree";
import type { Profile } from "@/lib/auth";

export async function Sidebar({ profile, activeUnitId }: { profile: Profile; activeUnitId?: string }) {
  const isQao = profile.role === "qao";

  let treeSection: React.ReactNode = null;

  if (isQao) {
    const units = await getAllUnits();
    const tree = buildUnitTree(units);
    treeSection = (
      <SidebarTree
        academics={tree.academics}
        administration={tree.administration}
        activeUnitId={activeUnitId}
      />
    );
  } else if (profile.unit_id) {
    const active = activeUnitId === profile.unit_id || !activeUnitId;
    treeSection = (
      <div className="pt-5 pb-8 flex flex-col gap-1">
        <div className="px-4 pb-2 text-[10px] font-bold text-gold/70 uppercase tracking-widest">
          My Office
        </div>
        {profile.unit_name && (
          <p className="px-4 text-[11px] text-white/35 font-medium truncate mb-1">
            {profile.unit_name}
          </p>
        )}
        <Link
          href={`/repository/${profile.unit_id}`}
          className={`flex items-center gap-2.5 pl-4 pr-3 py-2.5 text-[13px] font-medium truncate border-l-2 transition-colors ${
            active
              ? "border-gold text-white bg-white/10"
              : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L11 7h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
          Repository
        </Link>
      </div>
    );
  }

  return (
    <nav className="w-52 bg-maroon-dark shrink-0 overflow-y-auto overflow-x-hidden hidden md:flex md:flex-col">
      <div className="flex-1">{treeSection}</div>
    </nav>
  );
}
