import Link from "next/link";
import { getAllUnits, buildUnitTree } from "@/lib/data/units";
import type { Profile } from "@/lib/auth";

export async function Sidebar({ profile, activeUnitId }: { profile: Profile; activeUnitId?: string }) {
  const isQao = profile.role === "qao";

  const links: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
  ];
  if (isQao) links.push({ label: "Account Approvals", href: "/admin/approvals" });

  let treeSection: React.ReactNode = null;

  if (isQao) {
    const units = await getAllUnits();
    const tree = buildUnitTree(units);
    treeSection = (
      <>
        <SectionLabel>Academics</SectionLabel>
        {tree.academics.map((college) => (
          <div key={college.id}>
            <div className="px-5 py-1 text-xs text-gray-400 font-medium truncate" title={college.name}>
              {college.name}
            </div>
            {college.departments.map((dept) => (
              <UnitLink key={dept.id} id={dept.id} name={dept.name} activeUnitId={activeUnitId} indent />
            ))}
          </div>
        ))}
        <SectionLabel>Administration</SectionLabel>
        {tree.administration.map((office) => (
          <UnitLink key={office.id} id={office.id} name={office.name} activeUnitId={activeUnitId} />
        ))}
      </>
    );
  } else if (profile.unit_id) {
    treeSection = (
      <>
        <SectionLabel>My Office</SectionLabel>
        <UnitLink id={profile.unit_id} name="My Repository" activeUnitId={activeUnitId} forceActive />
      </>
    );
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 shrink-0 overflow-y-auto hidden md:block">
      <div className="py-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="pb-6">{treeSection}</div>
    </nav>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-5 pt-4 pb-1 text-xs font-bold text-maroon-dark uppercase tracking-wide">{children}</div>;
}

function UnitLink({
  id,
  name,
  activeUnitId,
  indent,
  forceActive,
}: {
  id: string;
  name: string;
  activeUnitId?: string;
  indent?: boolean;
  forceActive?: boolean;
}) {
  const active = forceActive || activeUnitId === id;
  return (
    <Link
      href={`/repository/${id}`}
      className={`flex items-center gap-2 py-1.5 text-sm truncate border-l-4 ${
        indent ? "pl-8 pr-3" : "pl-5 pr-3"
      } ${
        active
          ? "border-gold bg-gold-light/40 text-maroon-dark font-semibold"
          : "border-transparent text-gray-600 hover:bg-gray-50"
      }`}
      title={name}
    >
      {name}
    </Link>
  );
}
